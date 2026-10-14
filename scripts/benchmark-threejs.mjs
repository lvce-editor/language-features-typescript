// Production project/host benchmark with native disk transport. This isolates
// synchronization CPU and filesystem calls; it does not measure application RPC.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build } from 'esbuild'

const root = process.cwd()
const sourceRoot = resolve(process.env.THREEJS_SOURCE_ROOT || root)
const temporary = mkdtempSync(join(tmpdir(), 'typescript-threejs-'))
const main = join(root, 'node_modules', '.threejs-benchmark.ts').replaceAll('\\', '/')
const configPath = join(root, 'node_modules', 'tsconfig.json').replaceAll('\\', '/')
const config = JSON.stringify({
  files: [main],
  compilerOptions: { strict: true, skipLibCheck: true, types: [], module: 'esnext', moduleResolution: 'bundler' },
})
const text = `import * as THREE from 'three';\nconst scene = new THREE.Scene();\nconst material = new THREE.MeshBasicMaterial({ color: 'dodgerblue', wireframe: true });\nscene.add(new THREE.Mesh(new THREE.BufferGeometry(), material));\nmaterial.color.set('blue');\n`
const part = (name) => join(sourceRoot, 'packages/typescript-worker/src/parts', name, `${name}.ts`)
try {
  const output = await build({
    stdin: {
      contents: `export {createFileSystem} from ${JSON.stringify(part('CreateFileSystem'))}; export {createCachedClient} from ${JSON.stringify(part('CachedFileClient'))}; export * as LanguageServices from ${JSON.stringify(part('LanguageServices'))}; export * as Services from ${JSON.stringify(part('GetOrCreateLanguageService'))};`,
      resolveDir: root,
      loader: 'ts',
    },
    plugins: [
      {
        name: 'native-libraries',
        setup(build) {
          build.onLoad({ filter: /[/\\]ReadLibFile[/\\]ReadLibFile\.ts$/ }, () => ({
            contents: `import {readFileSync} from 'node:fs'; import {basename,join} from 'node:path'; export const readLibFile = uri => { try {return readFileSync(join(${JSON.stringify(join(root, 'node_modules/typescript/lib'))},basename(uri)),'utf8')} catch {return undefined} };`,
            loader: 'js',
          }))
        },
      },
    ],
    bundle: true,
    platform: 'node',
    format: 'esm',
    write: false,
  })
  const bundle = join(temporary, 'host.mjs')
  writeFileSync(bundle, output.outputFiles[0].text)
  const { createFileSystem, createCachedClient, LanguageServices, Services } = await import(pathToFileURL(bundle))
  const ts = (await import('typescript')).default
  const samples = []
  for (let repetition = 0; repetition < 3; repetition++) {
    Services.resetLanguageServices()
    const calls = {}
    const raw = {
      invokeSync(method, ...args) {
        calls[method] = (calls[method] || 0) + 1
        const uri = args[0]
        if (method === 'FileCache.getHashes')
          return uri.map((path) => {
            try {
              return createHash('sha256')
                .update(path === configPath ? config : readFileSync(path))
                .digest('hex')
            } catch {
              return null
            }
          })
        if (method === 'SyncApi.getWorkspaceUri') return root.replaceAll('\\', '/')
        if (method === 'FileCache.getValidation') {
          const [directories, missing] = args
          return {
            available: missing.map((path) => existsSync(path)),
            entries: directories.map((path) => {
              try {
                return readdirSync(path)
              } catch {
                return []
              }
            }),
          }
        }
        if (method === 'SyncApi.exists') return uri === configPath || existsSync(uri)
        if (method === 'SyncApi.readFileSync') return uri === configPath ? config : readFileSync(uri, 'utf8')
        if (method === 'SyncApi.readDirSync') {
          try {
            return readdirSync(uri)
          } catch {
            return []
          }
        }
        if (method === 'SyncApi.getDirectoriesSync') {
          try {
            return readdirSync(uri, { withFileTypes: true })
              .filter((x) => x.isDirectory())
              .map((x) => x.name)
          } catch {
            return []
          }
        }
        throw Error(method)
      },
    }
    const fs = createFileSystem()
    const client = createCachedClient(raw, fs)
    LanguageServices.set(1, fs, client, ts)
    const run = (value) => {
      for (const key of Object.keys(calls)) delete calls[key]
      const start = performance.now()
      const { languageService } = Services.getOrCreateLanguageService(main)
      fs.writeFile(main, value)
      const diagnostics = languageService.getSemanticDiagnostics(main)
      const diagnosticMs = performance.now() - start
      assert.deepEqual(
        diagnostics.map((x) => x.code),
        [],
        JSON.stringify(diagnostics.map((x) => x.messageText)),
      )
      const completionStart = performance.now()
      const completionService = Services.getOrCreateLanguageService(main).languageService
      const completions = completionService.getCompletionsAtPosition(
        main,
        value.indexOf('color.set') + 'color.'.length,
        {},
      )
      assert.ok(
        completions?.entries.some((x) => x.name === 'setHex'),
        'missing Three.js completion',
      )
      return {
        diagnosticMs,
        completionMs: performance.now() - completionStart,
        calls: { ...calls },
        sourceFiles: languageService.getProgram().getSourceFiles().length,
      }
    }
    const cold = run(text)
    const edits = []
    for (let i = 0; i < 5; i++) {
      edits.push(run(text.replace("'blue'", `'blue${i}'`)))
      await new Promise((resolve) => setImmediate(resolve))
    }
    if (process.env.THREEJS_ENFORCE_REUSE === '1') {
      for (const edit of edits) assert.ok((edit.calls['SyncApi.readFileSync'] || 0) <= 10, JSON.stringify(edit))
    }
    samples.push({ cold, edits })
    client.dispose?.()
  }
  console.log(
    JSON.stringify(
      {
        sourceRoot,
        typescript: ts.version,
        threeTypes: JSON.parse(readFileSync(join(root, 'node_modules/@types/three/package.json'), 'utf8')).version,
        samples,
      },
      null,
      2,
    ),
  )
} finally {
  rmSync(temporary, { recursive: true, force: true })
}
