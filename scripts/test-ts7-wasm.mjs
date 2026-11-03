import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { instantiateWasm } from 'typescript7/wasm'
import { createSession, version } from '../packages/typescript-worker/src/parts/Ts7Session/Ts7Session.ts'

const libRoot = new URL('../node_modules/@typescript/typescript-wasip1-wasm/lib/', import.meta.url)
const names = JSON.parse(await readFile(new URL('libFiles.json', libRoot), 'utf8'))
const libraries = Object.fromEntries(
  await Promise.all(names.map(async (name) => [name, await readFile(new URL(name, libRoot), 'utf8')])),
)
const wasm = await WebAssembly.compile(await readFile(new URL('tsc.wasm', libRoot)))

test('the bundled host, compiler artifact, and reported compiler version match exactly', async () => {
  const host = JSON.parse(await readFile(new URL('../node_modules/typescript7/package.json', import.meta.url), 'utf8'))
  const artifact = JSON.parse(
    await readFile(new URL('../node_modules/@typescript/typescript-wasip1-wasm/package.json', import.meta.url), 'utf8'),
  )
  assert.equal(host.version, version)
  assert.equal(artifact.version, version)
})

const setup = async (t, base = 'file:///workspace') => {
  const files = new Map([
    [
      `${base}/tsconfig.json`,
      JSON.stringify({
        compilerOptions: { strict: true, types: [], module: 'esnext', moduleResolution: 'bundler' },
        include: ['**/*.ts'],
      }),
    ],
    [`${base}/model.ts`, 'export const model = { title: "hello", count: 1 };'],
    [`${base}/node_modules/example/package.json`, '{"name":"example","types":"index.d.ts"}'],
    [`${base}/node_modules/example/index.d.ts`, 'export declare const dependency: { packageValue: string };'],
  ])
  const host = {
    readFile: (uri) => files.get(uri),
    readDirectory(uri) {
      const prefix = uri.replace(/\/$/, '') + '/'
      const entries = [...files.keys()]
        .filter((path) => path.startsWith(prefix))
        .map((path) => path.slice(prefix.length))
      if (!entries.length) return undefined
      return {
        directories: [...new Set(entries.filter((path) => path.includes('/')).map((path) => path.split('/')[0]))],
        files: entries.filter((path) => !path.includes('/')),
      }
    },
  }
  const session = createSession(await instantiateWasm(wasm), libraries, host)
  t.after(() => session.close())
  const document = (text, name = 'main.ts') => ({ text, uri: `${base}/${name}` })
  const complete = (text) =>
    session.completion(document(text), text.length, [`${base}/main.ts`, `${base}/model.ts`]).map((item) => item.label)
  const diagnostics = (text) => session.diagnostics(document(text), [`${base}/main.ts`, `${base}/model.ts`])
  return { base, complete, diagnostics, document, files, session }
}

test('official WASM resolves imported source and npm declarations for completion and diagnostics', async (t) => {
  const { complete, diagnostics } = await setup(t)
  assert(complete('import { model } from "./model.js"; model.').includes('title'))
  assert(complete('import { dependency } from "example"; dependency.').includes('packageValue'))
  assert.equal(
    diagnostics('import { dependency } from "example"; const x: string = dependency.packageValue;').length,
    0,
  )
  assert(
    diagnostics('import { model } from "./model.js"; const x: string = model.count;').some(
      (item) => item.code === 2322,
    ),
  )
})

test('unsaved imported edits survive preview tab replacement and saved overrides can retire', async (t) => {
  const { base, complete, diagnostics, document, files, session } = await setup(t)
  session.diagnostics(document('export const model = { changed: true };', 'model.ts'), [])
  assert(complete('import { model } from "./model.js"; model.').includes('changed'))
  assert(!complete('import { model } from "./model.js"; model.').includes('title'))
  assert(diagnostics('import { model } from "./model.js"; model.title;').some((item) => item.code === 2339))
  assert(
    session
      .diagnostics(document('import { model } from "./model.js"; model.title;'), [document('').uri])
      .some((item) => item.code === 2339),
  )
  files.set(`${base}/model.ts`, 'export const model = { changed: true };')
  session.diagnostics(document('import { model } from "./model.js"; model.changed;'), [document('').uri])
  files.set(`${base}/model.ts`, 'export const model = { title: "hello", count: 1 };')
  assert(complete('import { model } from "./model.js"; model.').includes('title'))
})

test('disk edits, missing imports, recreation, dependency and configuration changes are observed', async (t) => {
  const { base, complete, diagnostics, files } = await setup(t)
  assert(diagnostics('import { added } from "./added.js"; added;').some((item) => item.code === 2307))
  files.set(`${base}/added.ts`, 'export const added = 1;')
  assert.equal(diagnostics('import { added } from "./added.js"; added;').length, 0)
  files.set(`${base}/node_modules/example/index.d.ts`, 'export declare const dependency: { replaced: number };')
  assert(complete('import { dependency } from "example"; dependency.').includes('replaced'))
  files.delete(`${base}/added.ts`)
  assert(diagnostics('import { added } from "./added.js"; added;').some((item) => item.code === 2307))
  files.set(`${base}/tsconfig.json`, JSON.stringify({ compilerOptions: { strict: false, types: [] } }))
  assert.equal(diagnostics('function loose(arg) { return arg; }').length, 0)
})

test('syntax diagnostics and UTF-16 diagnostic ranges survive non-ASCII text', async (t) => {
  const { diagnostics } = await setup(t)
  assert(diagnostics('const broken = ;').some((item) => item.code === 1109))
  const text = 'const emoji = "😀"; const wrong: number = "bad";'
  const diagnostic = diagnostics(text).find((item) => item.code === 2322)
  assert(diagnostic)
  assert.equal(diagnostic.columnIndex, text.indexOf('wrong'))
  assert.equal(diagnostic.endColumnIndex, text.indexOf('wrong') + 'wrong'.length)
})

test('virtual filesystem URIs preserve project and dependency resolution', async (t) => {
  const { complete, diagnostics } = await setup(t, 'memfs://project/workspace')
  assert(complete('import { model } from "./model.js"; model.').includes('title'))
  const result = diagnostics('const bad: number = "string";')
  assert.equal(result[0].uri, 'memfs://project/workspace/main.ts')
})

test('diagnostic chains and unnecessary-code warnings retain their editor metadata', async (t) => {
  const { base, diagnostics, files } = await setup(t)
  files.set(
    `${base}/tsconfig.json`,
    JSON.stringify({ compilerOptions: { strict: true, types: [], noUnusedLocals: true } }),
  )
  const result = diagnostics('export {}; type A = { foo: string }; const obj = { foo: 1 }; const a: A = obj;')
  const error = result.find((item) => item.code === 2322)
  assert(
    error.message.includes(
      "\n  Types of property 'foo' are incompatible.\n    Type 'number' is not assignable to type 'string'.",
    ),
  )
  const unused = result.find((item) => item.code === 6133)
  assert.equal(unused.type, 'warning')
  assert.deepEqual(unused.tags, [1])
})

test('completion offsets remain correct after non-ASCII text', async (t) => {
  const { complete } = await setup(t)
  assert(complete('const emoji = "😀"; const model = { hello: true }; model.').includes('hello'))
})
