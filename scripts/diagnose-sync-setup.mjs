import { readFile, writeFile } from 'node:fs/promises'

const replaceOnce = async (path, before, after) => {
  const source = await readFile(path, 'utf8')
  if (source.split(before).length !== 2) throw new Error(`Expected one diagnostic target in ${path}`)
  await writeFile(path, source.replace(before, after))
}

const client = 'packages/typescript-worker/src/parts/CreateSharedSyncRpcClient/CreateSharedSyncRpcClient.ts'
for (const [stage, statement] of [
  ['worker-directory', 'const root = await navigator.storage.getDirectory()'],
  ['worker-file', 'textHandle = await root.getFileHandle(`file-content-${syncId}.txt`, { create: true })'],
  ['worker-access', "textAccessHandle = await textHandle.createSyncAccessHandle({ mode: 'readwrite-unsafe' })"],
  ['setup-rpc', "await Rpc.invoke('SyncApi.setupShared', syncId, shared, maxDelay, textAccessHandle ? textHandle : undefined)"],
]) {
  await replaceOnce(client, statement, `recordSyncDiagnostic('[sync-setup] ${stage} begin', syncId)\n${statement}\nrecordSyncDiagnostic('[sync-setup] ${stage} end', syncId)`)
}
const extension = 'packages/extension/src/parts/SyncApi/SyncApi.ts'
await replaceOnce(extension,
  "textAccessHandle = await textHandle.createSyncAccessHandle({ mode: 'readwrite-unsafe' })",
  "recordSyncDiagnostic('[sync-setup] extension-access begin', id)\ntextAccessHandle = await textHandle.createSyncAccessHandle({ mode: 'readwrite-unsafe' })\nrecordSyncDiagnostic('[sync-setup] extension-access end', id)")
await replaceOnce(extension, 'SyncSetupState.set(id, { maxDelay, shared, textAccessHandle })',
  "recordSyncDiagnostic('[sync-setup] extension-ready', id)\nSyncSetupState.set(id, { maxDelay, shared, textAccessHandle })")

await replaceOnce(client, 'void Rpc.invoke(method, syncId, ...params)',
  "recordSyncDiagnostic('[sync-setup] invoke begin', method)\nvoid Rpc.invoke(method, syncId, ...params)")
await replaceOnce(client, 'const state = Atomics.load(header, 0)',
  "const state = Atomics.load(header, 0)\nrecordSyncDiagnostic('[sync-setup] received state', method, state)")
await replaceOnce(client, "failed = true",
  "recordSyncDiagnostic('[sync-setup] invoke timeout', method)\nfailed = true")
const writer = 'packages/extension/src/parts/WriteResult/WriteResult.ts'
await replaceOnce(writer, 'const { code, error, result } = await getResponse(resultGenerator)',
  "recordSyncDiagnostic('[sync-setup] response begin', id)\nconst { code, error, result } = await getResponse(resultGenerator)\nrecordSyncDiagnostic('[sync-setup] response ready', id)")
const chunks = 'packages/extension/src/parts/WriteSharedResult/WriteSharedResult.ts'
await replaceOnce(chunks, 'Atomics.notify(header, 0)',
  "recordSyncDiagnostic('[sync-setup] publish chunk', state, chunk.length)\nAtomics.notify(header, 0)")
await replaceOnce(chunks, "const acknowledged = await Atomics.waitAsync(header, 0, 1, setup.maxDelay).value",
  "recordSyncDiagnostic('[sync-setup] ack begin')\nconst acknowledged = await Atomics.waitAsync(header, 0, 1, setup.maxDelay).value\nrecordSyncDiagnostic('[sync-setup] ack end', acknowledged)")

const cache = 'packages/typescript-worker/src/parts/CachedFileClient/CachedFileClient.ts'
for (const [stage, statement] of [
  ['cache-file', "const file: CacheFileHandle = await Rpc.invoke('FileCache.getHandle', name)"],
]) await replaceOnce(cache, statement,
  `recordSyncDiagnostic('[sync-setup] ${stage} begin', name)\n${statement}\nrecordSyncDiagnostic('[sync-setup] ${stage} end', name)`)
await replaceOnce(cache, 'return await file.createSyncAccessHandle()',
  "recordSyncDiagnostic('[sync-setup] cache-access begin', name)\nconst handle = await file.createSyncAccessHandle()\nrecordSyncDiagnostic('[sync-setup] cache-access end', name)\nreturn handle")
await replaceOnce(cache, "return await Rpc.invoke('FileCache.startWatching')",
  "recordSyncDiagnostic('[sync-setup] watch begin')\nconst result = await Rpc.invoke('FileCache.startWatching')\nrecordSyncDiagnostic('[sync-setup] watch end')\nreturn result")

// Buffer synchronous events; emit only after the normal scenario would finish.
// Console I/O around Atomics.notify can otherwise suppress the observed race.
for (const path of [client, extension, writer, chunks, cache]) {
  const source = await readFile(path, 'utf8')
  const recorder = `const recordSyncDiagnostic = (() => {
    const entries: any[] = []
    setInterval(() => {
      if (entries.length) console.error('[sync-setup]', JSON.stringify(entries.splice(0)))
    }, 10000)
    return (...args: any[]) => { entries.push({ time: performance.now(), args }) }
  })()\n`
  await writeFile(path, recorder + source)
}

const runner = 'node_modules/@lvce-editor/test-with-playwright-worker/dist/workerMain.js'
await replaceOnce(runner, "import { fork } from 'node:child_process';",
  "import { fork } from 'node:child_process';\nimport { appendFileSync, mkdirSync } from 'node:fs';")
await replaceOnce(runner,
  "    await navigateToTest(page, url);",
  `    mkdirSync('.e2e-artifacts', { recursive: true });
    const diagnosticListener = message => {
      const text = message.text();
      if (text.startsWith('[sync-setup]')) appendFileSync('.e2e-artifacts/sync-setup.jsonl', JSON.stringify({ test, time: Date.now(), text }) + '\\n');
    };
    if (page.__syncSetupListener) page.off('console', page.__syncSetupListener);
    page.__syncSetupListener = diagnosticListener;
    page.on('console', diagnosticListener);
    await navigateToTest(page, url);`)
console.log('Installed targeted synchronous RPC setup diagnostics')
