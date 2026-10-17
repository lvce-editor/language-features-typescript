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
  await replaceOnce(client, statement, `console.error('[sync-setup] ${stage} begin', syncId)\n${statement}\nconsole.error('[sync-setup] ${stage} end', syncId)`)
}
const extension = 'packages/extension/src/parts/SyncApi/SyncApi.ts'
await replaceOnce(extension,
  "textAccessHandle = await textHandle.createSyncAccessHandle({ mode: 'readwrite-unsafe' })",
  "console.error('[sync-setup] extension-access begin', id)\ntextAccessHandle = await textHandle.createSyncAccessHandle({ mode: 'readwrite-unsafe' })\nconsole.error('[sync-setup] extension-access end', id)")
await replaceOnce(extension, 'SyncSetupState.set(id, { maxDelay, shared, textAccessHandle })',
  "console.error('[sync-setup] extension-ready', id)\nSyncSetupState.set(id, { maxDelay, shared, textAccessHandle })")

const cache = 'packages/typescript-worker/src/parts/CachedFileClient/CachedFileClient.ts'
for (const [stage, statement] of [
  ['cache-file', "const file: CacheFileHandle = await Rpc.invoke('FileCache.getHandle', name)"],
]) await replaceOnce(cache, statement,
  `console.error('[sync-setup] ${stage} begin', name)\n${statement}\nconsole.error('[sync-setup] ${stage} end', name)`)
await replaceOnce(cache, 'return await file.createSyncAccessHandle()',
  "console.error('[sync-setup] cache-access begin', name)\nconst handle = await file.createSyncAccessHandle()\nconsole.error('[sync-setup] cache-access end', name)\nreturn handle")
await replaceOnce(cache, "return await Rpc.invoke('FileCache.startWatching')",
  "console.error('[sync-setup] watch begin')\nconst result = await Rpc.invoke('FileCache.startWatching')\nconsole.error('[sync-setup] watch end')\nreturn result")

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
