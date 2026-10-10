// Browser microbenchmark of the production cache/client and language host. The source
// transport is HTTP, not the extension RPC; integrated routing is covered by e2e.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createServer } from 'node:http'
import { mkdtemp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve, sep } from 'node:path'
import { chromium } from 'playwright'
import { build } from 'esbuild'
import { getTypeScriptLibManifest } from '../packages/build/src/getTypeScriptLibManifest.ts'

const root = process.cwd()
const temporary = await mkdtemp(join(tmpdir(), 'typescript-file-cache-'))
const project = join(temporary, 'project')
await mkdir(join(project, 'node_modules/pkg'), { recursive: true })
const imports = []
for (let i = 0; i < 20; i++) {
  await writeFile(join(project, `file${i}.ts`), `export const value${i}: number = ${i};\n`)
  await writeFile(join(project, `node_modules/pkg/type${i}.d.ts`), `export declare const dependency${i}: number;\n`)
  imports.push(
    `import { value${i} } from './file${i}'; import { dependency${i} } from './node_modules/pkg/type${i}';\nconst result${i}: string = value${i} + dependency${i};`,
  )
}
const mainText = imports.join('\n')
await writeFile(join(project, 'main.ts'), mainText)
const manifest = await getTypeScriptLibManifest(join(root, 'node_modules/typescript/lib'))
const source = `
import { createCachedClient } from './packages/typescript-worker/src/parts/CachedFileClient/CachedFileClient.ts'
import { createFileContentCache } from './packages/typescript-worker/src/parts/FileContentCache/FileContentCache.ts'
import { createFileSystem } from './packages/typescript-worker/src/parts/CreateFileSystem/CreateFileSystem.ts'
import { createTypeScriptLanguageService } from './packages/typescript-worker/src/parts/CreateTypeScriptLanguageService/CreateTypeScriptLanguageService.ts'
import * as ReadLibFile from './packages/typescript-worker/src/parts/ReadLibFile/ReadLibFile.ts'
let client
self.onmessage = async ({data: mode}) => {
  if (mode === 'close') { client?.dispose?.(); self.postMessage({closed: true}); return }
  try {
    const started = performance.now()
    await ReadLibFile.initialize()
    const ts = (await import('/node_modules/typescript/lib/typescript-esm.js')).ts
    const fs = createFileSystem()
    fs.writeFile('/workspace/main.ts', ${JSON.stringify(mainText)})
    const raw = { invokeSync(method, ...args) {
      const xhr = new XMLHttpRequest()
      xhr.open('GET', '/rpc?value=' + encodeURIComponent(JSON.stringify({method, args})), false)
      xhr.send()
      const result = JSON.parse(xhr.responseText)
      if (result.error) throw new Error(result.error)
      return result.value
    } }
    const directory = await (await navigator.storage.getDirectory()).getDirectoryHandle('file-cache-benchmark', {create:true})
    const open = async name => {
      try { return createFileContentCache(await (await directory.getFileHandle(name, {create:true})).createSyncAccessHandle()) }
      catch { return undefined }
    }
    client = mode === 'baseline' ? raw : createCachedClient(raw, fs, await open('files'), await open('dependencies'))
    const initializationMs = performance.now() - started
    const service = createTypeScriptLanguageService(ts, fs, client, {
      options: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.CommonJS, moduleResolution: ts.ModuleResolutionKind.Node10, types: [] },
      fileNames: ['/workspace/main.ts'], errors: []
    })
    const diagnosticStart = performance.now()
    const diagnostics = service.getSemanticDiagnostics('/workspace/main.ts')
    const diagnosticsMs = performance.now() - diagnosticStart
    const result = {initializationMs, diagnosticsMs, count: diagnostics.length, codes: diagnostics.map(x=>x.code), cache: client.getCacheStatistics?.()}
    service.dispose()
    if (mode !== 'hold') client.dispose?.()
    self.postMessage(result)
  } catch(error) { self.postMessage({error: String(error), stack: error.stack}) }
}
`
const output = await build({
  stdin: { contents: source, resolveDir: root, loader: 'ts' },
  bundle: true,
  format: 'esm',
  write: false,
})
const worker = output.outputFiles[0].text.replaceAll(
  '"__TYPE_SCRIPT_LIB_MANIFEST__"',
  JSON.stringify(JSON.stringify(manifest)),
)
let counters
const identities = new Map()
const resetCounters = () => {
  counters = { sourceReads: 0, identityRequests: 0, identitiesChecked: 0, hashContentReads: 0, libRequests: 0 }
}
const pathFor = (uri) => {
  if (uri === '/workspace') return project
  if (!uri.startsWith('/workspace/')) return undefined
  const path = resolve(project, uri.slice('/workspace/'.length))
  return path.startsWith(project + sep) ? path : undefined
}
const identity = async (uri) => {
  const path = pathFor(uri)
  if (!path) return null
  try {
    const info = await stat(path, { bigint: true })
    if (!info.isFile()) return null
    const version = [info.dev, info.ino, info.size, info.mtimeNs, info.ctimeNs].join(':')
    if (identities.get(path)?.version === version) return identities.get(path).hash
    counters.hashContentReads++
    const hash = createHash('sha256')
      .update(await readFile(path))
      .digest('hex')
    identities.set(path, { version, hash })
    return hash
  } catch {
    return null
  }
}
const server = createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost')
  try {
    if (url.pathname === '/rpc') {
      const { method, args } = JSON.parse(url.searchParams.get('value'))
      let value
      if (method === 'FileCache.getHashes') {
        counters.identityRequests++
        counters.identitiesChecked += args[0].length
        value = await Promise.all(args[0].map(identity))
      } else {
        const path = pathFor(args[0])
        if (method === 'SyncApi.exists')
          value = path
            ? await stat(path).then(
                () => true,
                () => false,
              )
            : false
        else if (method === 'SyncApi.readDirSync') value = path ? await readdir(path).catch(() => []) : []
        else if (method === 'SyncApi.readFileSync') {
          counters.sourceReads++
          if (!path) throw new Error('Not found')
          value = await readFile(path, 'utf8')
        } else throw new Error('Unknown method ' + method)
      }
      response.end(JSON.stringify({ value }))
      return
    }
    let content
    if (url.pathname === '/') content = '<html></html>'
    else if (url.pathname === '/packages/typescript-worker/dist/benchmark.js') content = worker
    else {
      const path = resolve(root, '.' + url.pathname)
      if (!path.startsWith(root + sep)) throw new Error('Invalid path')
      if (/\/lib\.[^/]*d\.ts$/.test(url.pathname)) counters.libRequests++
      content = await readFile(path)
    }
    response.setHeader('content-type', url.pathname === '/' ? 'text/html' : 'text/javascript')
    response.end(content)
  } catch (error) {
    response.end(JSON.stringify({ error: String(error) }))
  }
})
let browser
try {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.goto(`http://127.0.0.1:${server.address().port}/`)
  const run = async (mode) => {
    resetCounters()
    const result = await page.evaluate(
      (mode) =>
        new Promise((resolve, reject) => {
          const worker = new Worker('/packages/typescript-worker/dist/benchmark.js', { type: 'module' })
          worker.onerror = (event) => {
            worker.terminate()
            reject(new Error(event.message))
          }
          worker.onmessage = ({ data }) => {
            if (mode === 'hold') globalThis.heldWorker = worker
            else worker.terminate()
            resolve(data)
          }
          worker.postMessage(mode)
        }),
      mode,
    )
    assert.equal(result.error, undefined, JSON.stringify(result))
    assert.equal(result.count, 20, JSON.stringify(result))
    assert.deepEqual([...new Set(result.codes)], [2322])
    return { ...result, counters: { ...counters } }
  }
  const clear = () =>
    page.evaluate(async () => {
      const root = await navigator.storage.getDirectory()
      await root.removeEntry('file-cache-benchmark', { recursive: true }).catch(() => {})
    })
  const runs = []
  // Warm the unchanged existing library cache; only the new two caches vary.
  await run('baseline')
  for (let i = 0; i < 5; i++) {
    await clear()
    identities.clear()
    const baseline = await run('baseline')
    const cold = await run('cache')
    const warm = await run('cache')
    assert.equal(warm.counters.sourceReads, 0)
    assert.equal(warm.counters.hashContentReads, 0)
    assert.equal(warm.counters.libRequests, 0)
    assert.ok(warm.cache.generalHits > 0 && warm.cache.dependencyHits > 0)
    runs.push({ baseline, cold, warm })
  }
  const holder = await run('hold')
  const concurrent = await run('cache')
  // An OPFS-denied client still tracks disk identities for project invalidation.
  // Both content caches must remain disabled and use the source transport.
  assert.equal(concurrent.cache.generalEnabled, false)
  assert.equal(concurrent.cache.dependenciesEnabled, false)
  assert.equal(concurrent.cache.generalHits, 0)
  assert.equal(concurrent.cache.dependencyHits, 0)
  assert.ok(concurrent.counters.sourceReads > 0)
  await page.evaluate(() => globalThis.heldWorker.terminate())
  const afterTermination = await run('cache')
  assert.equal(afterTermination.counters.sourceReads, 0)
  // Corrupt a committed body after all owning workers have exited.
  await page.evaluate(async () => {
    const directory = await (await navigator.storage.getDirectory()).getDirectoryHandle('file-cache-benchmark')
    const handle = await directory.getFileHandle('files')
    const writer = await handle.createWritable({ keepExistingData: true })
    await writer.write({ type: 'write', position: 68, data: new Uint8Array([0]) })
    await writer.close()
  })
  const corrupt = await run('cache')
  assert.equal(corrupt.counters.sourceReads, 1)
  const recovered = await run('cache')
  assert.equal(recovered.counters.sourceReads, 0)
  console.log(
    JSON.stringify(
      { runs, concurrency: { holder, concurrent, afterTermination }, corruption: { corrupt, recovered } },
      null,
      2,
    ),
  )
} finally {
  await browser?.close()
  server.close()
  await rm(temporary, { recursive: true, force: true })
}
