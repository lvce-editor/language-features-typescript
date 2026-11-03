import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { instantiateWasm } from 'typescript7/wasm'
import { createSession, getHostUri, version } from '../packages/typescript-worker/src/parts/Ts7Session/Ts7Session.ts'

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

const setup = async (t, base = 'file:///workspace', validateUri = () => {}) => {
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
    readFile: (uri) => {
      validateUri(uri)
      return files.get(uri)
    },
    readDirectory(uri) {
      validateUri(uri)
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

test('virtual projects apply their declared libraries, strictness, and unused-code settings', async (t) => {
  const { base, complete, diagnostics, files } = await setup(t, 'memfs:///fixture')
  files.set(
    `${base}/tsconfig.json`,
    JSON.stringify({
      compilerOptions: { strict: true, noUnusedLocals: true, types: [], lib: ['esnext', 'webworker'] },
    }),
  )
  const completions = complete('WorkerG')
  assert(completions.includes('WorkerGlobalScope'))
  assert(!completions.includes('window'))
  assert(diagnostics('function f(arg) { return arg; }').some((item) => item.code === 7006))
  assert(diagnostics('export {}; const unused = 1;').some((item) => item.code === 6133))
  files.set(`${base}/tsconfig.json`, JSON.stringify({ compilerOptions: { strict: false, types: [] } }))
  assert.equal(diagnostics('function f(arg) { return arg; }').length, 0)
})

test('completion prefers the typed case among otherwise equally ranked suggestions', async (t) => {
  const { complete } = await setup(t)
  assert.equal(complete('win')[0], 'window')
})

test('hoisted package-name completion works for a file excluded by its nearest config', async (t) => {
  const { base, document, files, session } = await setup(t, 'memfs:///fixture', (uri) => {
    assert(!uri.startsWith('file:'), `Unexpected host disk probe: ${uri}`)
  })
  files.clear()
  const paths = [
    'package.json',
    'packages/app/package.json',
    'packages/app/tsconfig.json',
    'packages/app/src/test.ts',
    'node_modules/lodash/package.json',
    'node_modules/lodash/index.js',
  ]
  for (const path of paths) {
    const source = new URL('../packages/e2e/fixtures/completion-from-node-modules-monorepo/' + path, import.meta.url)
    files.set(base + '/' + path, await readFile(source, 'utf8'))
  }
  const main = document(files.get(base + '/packages/app/src/test.ts'), 'packages/app/src/test.ts')
  for (let attempt = 0; attempt < 3; attempt++) {
    session.diagnostics(main, [main.uri])
    assert(session.completion(main, 20, [main.uri]).some((item) => item.label === 'lodash'))
  }
})

test('equally ranked import paths have a stable name order', async (t) => {
  const { base, document, files, session } = await setup(t, 'memfs:///fixture')
  files.clear()
  files.set(
    base + '/tsconfig.json',
    JSON.stringify({ compilerOptions: { lib: ['esnext'], types: [] }, include: ['add.ts', 'test.ts'] }),
  )
  files.set(base + '/add.ts', 'export const add = (a, b) => a + b')
  const text = "import { add } from './'"
  files.set(base + '/test.ts', text)
  const main = document(text, 'test.ts')
  for (let attempt = 0; attempt < 3; attempt++) {
    assert.deepEqual(
      session.completion(main, text.length - 1, [main.uri]).map((item) => item.label),
      ['add.js', 'tsconfig.json'],
    )
  }
})

test('synthetic WASM roots cannot become drive-less Windows host paths', () => {
  const document = new URL('file:///C:/workspace/main.ts')
  assert.equal(getHostUri('/node_modules/@types', document), undefined)
  const uri = getHostUri('C:/workspace/main.ts', document)
  assert.equal(fileURLToPath(uri, { windows: true }), 'c:\\workspace\\main.ts')
  assert.equal(getHostUri('/workspace/main.ts', new URL('file:///workspace/main.ts')), 'file:///workspace/main.ts')
})

test('TS7 preserves hover, outline, signatures, and navigation across source and bundled libraries', async (t) => {
  const { document, session } = await setup(t)
  const text =
    '/** The current model. */\nexport const hoverExample: string | undefined = undefined;\nexport class Widget { value = 1; method(input: string): number { return input.length; } }\nconst widget = new Widget();\nwidget.method("hello");\nconsole.log(hoverExample);'
  const doc = document(text)
  const run = (execute) => session.feature(doc, [doc.uri], execute)
  const hover = run((features) => features.hover(text.indexOf('hoverExample')))
  assert.equal(hover.displayString, 'const hoverExample: string | undefined')
  assert.equal(hover.documentation, 'The current model.')
  const symbols = run((features) => features.documentSymbols())
  const widget = symbols.find((symbol) => symbol.name === 'Widget')
  assert.deepEqual(
    widget.children.map((symbol) => symbol.name),
    ['value', 'method'],
  )
  assert.equal(text.slice(widget.selectionStartOffset, widget.selectionEndOffset), 'Widget')
  const definition = run((features) => features.definition(text.lastIndexOf('hoverExample')))
  assert.equal(definition.uri, doc.uri)
  assert.equal(definition.startOffset, text.indexOf('hoverExample'))
  const library = run((features) => features.definition(text.indexOf('console.log')))
  assert(library.uri.startsWith('bundled:///libs/'))
  const signature = run((features) => features.signatureHelp(text.indexOf('"hello"') + 1))
  assert.equal(signature.signatures[0].label, 'widget.method(input: string): number')
  const type = run((features) => features.definition(text.indexOf('widget.method'), true))
  assert.equal(type.startOffset, text.indexOf('Widget'))
})

test('TS7 semantic references and rename include unsaved cross-file uses without changing shadowed names', async (t) => {
  const { base, document, files, session } = await setup(t, 'memfs:///project')
  const model = 'export const model = 1;'
  files.set(`${base}/model.ts`, model)
  const text = 'import { model } from "./model.js"; console.log(model); function local(model: string) { return model; }'
  const doc = document(text)
  const run = (execute) => session.feature(doc, [doc.uri], execute)
  const refs = run((features) => features.references(text.indexOf('console.log(model') + 12))
  assert.equal(refs.length, 3)
  assert.equal(refs.filter((ref) => ref.uri === doc.uri).length, 2)
  const rename = run((features) => features.rename(text.indexOf('console.log(model') + 12, 'renamed'))
  assert.equal(rename.edits.length, 3)
  assert(rename.edits.every((edit) => edit.edits[0].inserted === 'renamed'))
  const imported = run((features) => features.definition(text.indexOf('console.log(model') + 12))
  assert.equal(imported.uri, `${base}/model.ts`)
  assert.equal(imported.startOffset, model.indexOf('model'))
})

test('TS7 import actions preserve used bindings and side effects and add unambiguous exports', async (t) => {
  const { document, session } = await setup(t)
  const text =
    'import unused from "unused";\nimport { model, missing } from "./model.js";\nimport "./side-effect.js";\nconsole.log(model);\n'
  const doc = document(text)
  const edits = session.feature(doc, [doc.uri], (features) => features.organizeImports())
  const apply = (text, edits) =>
    edits
      .toSorted((a, b) => b.startOffset - a.startOffset)
      .reduce((text, edit) => text.slice(0, edit.startOffset) + edit.inserted + text.slice(edit.endOffset), text)
  assert.equal(
    apply(text, edits),
    'import { model } from "./model.js";\nimport "./side-effect.js";\nconsole.log(model);\n',
  )
  const missing = document('export const value = model.title;')
  const added = session.feature(missing, [missing.uri], (features) => features.addMissingImports())
  assert(apply(missing.text, added).includes('import { model } from "./model.js";'))
})

test('TS7 quick fixes preserve spelling, unused-import, and missing-property actions', async (t) => {
  const { document, session } = await setup(t)
  const run = (text, offset) => session.feature(document(text), [], (features) => features.quickFixes(offset))
  assert(run('globalThis.AbortSignal.abrot()', 28).some((action) => action.name === "Change spelling to 'abort'"))
  assert(
    run('import unused from "unused";\nexport {};', 10).some((action) => action.name === "Remove import from 'unused'"),
  )
  const text = 'interface Item { data: string; type: string }\nconst items: Item[] = [{}];'
  const action = run(text, text.indexOf('{}') + 1).find((action) => action.name === 'Add missing properties')
  assert(action)
  assert(action.edits[0].inserted.includes('data: ""'))
})

test('TS7 rename handles object shorthand and import aliases without changing public property names', async (t) => {
  const { document, files, base, session } = await setup(t)
  files.set(`${base}/model.ts`, 'export const model = 1;')
  const doc = document('import { model as local } from "./model.js"; const object = { local }; console.log(local);')
  const result = session.feature(doc, [doc.uri], (features) =>
    features.rename(doc.text.lastIndexOf('local'), 'renamed'),
  )
  assert.equal(result.edits.length, 3)
  assert(result.edits.every((edit) => edit.uri === doc.uri))
  assert.equal(result.edits[1].edits[0].inserted, 'local: renamed')
})

test('TS7 selection keeps the established nested-call expansion sequence', async (t) => {
  const { document, session } = await setup(t)
  const doc = document('function run(id: string, options: object) {\n  return foo.bar(getUser(id), options)\n}\n')
  let selection = [1, 26, 1, 26]
  const expected = [
    [1, 25, 1, 27],
    [1, 17, 1, 28],
    [1, 17, 1, 37],
    [1, 9, 1, 38],
    [1, 2, 1, 38],
    [0, 43, 2, 0],
    [0, 42, 2, 1],
    [0, 0, 2, 1],
  ]
  for (let index = 0; index < expected.length; index++) {
    selection = session.feature(doc, [doc.uri], (features) => features.selections(selection))
    assert.deepEqual(selection, expected[index])
  }
})

test('TS7 namespace-import rename retains the declaration and importing use', async (t) => {
  const { base, document, files, session } = await setup(t, 'memfs:///fixture')
  files.clear()
  files.set(
    `${base}/tsconfig.json`,
    '{"compilerOptions":{"lib":["esnext"],"types":[],"module":"nodenext","moduleResolution":"nodenext"}}',
  )
  files.set(`${base}/src/parts/Main/Main.ts`, 'export const main = () => 1\n')
  const text = "import * as Main from './parts/Main/Main.js'\n\nMain.main()\n"
  const doc = document(text, 'src/aboutWorkerMain.ts')
  const refs = session.feature(doc, [doc.uri], (features) => features.references(text.lastIndexOf('main')))
  assert.equal(session.diagnostics(doc, [doc.uri]).length, 0)
  assert.equal(refs.length, 2)
  const result = session.feature(doc, [doc.uri], (features) => features.rename(text.lastIndexOf('main') + 1, 'gain'))
  assert.equal(result.edits[0].edits[0].offset, text.lastIndexOf('main'))
  assert.equal(result.edits.length, 2)
})

test('TS7 completion discovers project exports and resolves local symbol documentation', async (t) => {
  const { document, session } = await setup(t)
  const doc = document('export const value = mod')
  const completions = session.completion(doc, doc.text.length, [doc.uri])
  assert(completions.some((item) => item.label === 'model'))
  const local = document('/** A local model. */ const localModel = { title: "" }; localMod')
  const resolved = session.feature(
    local,
    [local.uri],
    (features) => features.resolveCompletion(local.text.length, 'localModel', { label: 'localModel' }),
    true,
  )
  assert.equal(resolved.documentation, 'A local model.')
  assert(resolved.detail.includes('localModel'))
})

test('TS7 function completion retains required arguments and avoids duplicate call parentheses', async (t) => {
  const { document, session } = await setup(t)
  const text =
    '/** Adds a value. */ function add(value: number, optional?: string, ...rest: number[]) { return value; }\nadd'
  const doc = document(text)
  const resolve = (doc, offset) =>
    session.feature(
      doc,
      [doc.uri],
      (features) => features.resolveCompletion(offset, 'add', { label: 'add', snippet: 'add' }),
      true,
    )
  assert.equal(resolve(doc, text.length).snippet, 'add(value)')
  assert.equal(resolve(document(text + '()'), text.length).snippet, 'add')
})
test('TS7 virtual completion discovers project exports and resolves local symbol documentation', async (t) => {
  const { document, session } = await setup(t, 'memfs:///fixture')
  const doc = document('export const value = mod')
  const completions = session.completion(doc, doc.text.length, [doc.uri])
  assert(completions.some((item) => item.label === 'model'))
  const local = document('/** A local model. */ const localModel = { title: "" }; localMod')
  const resolved = session.feature(
    local,
    [local.uri],
    (features) => features.resolveCompletion(local.text.length, 'localModel', { label: 'localModel' }),
    true,
  )
  assert.equal(resolved.documentation, 'A local model.')
  assert(resolved.detail.includes('localModel'))
})

test('TS7 auto-import fixture offers its unreferenced exported function', async (t) => {
  const { base, document, files, session } = await setup(t, 'memfs:///fixture')
  files.clear()
  for (const name of ['package.json', 'tsconfig.json', 'src/add.ts', 'src/test.ts'])
    files.set(
      `${base}/${name}`,
      await readFile(new URL('../packages/e2e/fixtures/auto-import/' + name, import.meta.url), 'utf8'),
    )
  const doc = document(files.get(`${base}/src/test.ts`), 'src/test.ts')
  const result = session.completion(doc, 11, [doc.uri])
  assert(result.some((item) => item.label === 'add'))
})

test('TS7 brace completion excludes comments and unterminated strings', async (t) => {
  const { document, session } = await setup(t)
  const pair = (text, offset = text.length) =>
    session.feature(document(text), [], (features) => features.braceCompletion(offset, '{'))
  assert.equal(pair('const value = '), true)
  assert.equal(pair('// a comment'), false)
  assert.equal(pair('const value = "text'), false)
  assert.equal(pair('/* comment */', 5), false)
  assert.equal(pair('const value = "text"; '), true)
})

test('TS7 implementations resolve an imported function at the start of its name', async (t) => {
  const { base, document, files, session } = await setup(t, 'memfs:///fixture')
  files.set(`${base}/add.ts`, 'export const add = () => {}')
  const doc = document('import { add } from "./add.js";\nadd();')
  const result = session.feature(doc, [doc.uri], (features) => features.implementations(9))
  assert.equal(result.length, 1)
  assert.equal(result[0].uri, `${base}/add.ts`)
})

test('TS7 navigation does not select an adjacent identifier on whitespace or a keyword', async (t) => {
  const { document, session } = await setup(t)
  const doc = document('import { model } from \"./model.js\";\n\nmodel;')
  assert.deepEqual(
    session.feature(doc, [], (features) => features.references(doc.text.indexOf('\n') + 1)),
    [],
  )
  assert.equal(
    session.feature(doc, [], (features) => features.hover(0)),
    undefined,
  )
  assert.equal(
    session.feature(doc, [], (features) => features.definition(doc.text.indexOf('\n') + 1)),
    undefined,
  )
})
