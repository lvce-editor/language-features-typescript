// Electron worker lifecycle benchmark using production services and request commands.
// Source transport is synchronous HTTP; integrated editor routing remains an e2e gate.
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve, sep } from 'node:path'
import { _electron } from 'playwright'
import { build } from 'esbuild'
import { getTypeScriptLibManifest } from '../packages/build/src/getTypeScriptLibManifest.ts'

const root = process.cwd()
const sourceRoot = resolve(process.env.ISOLATION_SOURCE_ROOT || root)
const baseline = process.env.ISOLATION_BASELINE === '1'
const temporary = await mkdtemp(join(tmpdir(), 'typescript-lifecycle-'))
const files = new Map()
const sourceText = `import { value } from './value.ts';\nexport const result: number = value;\nresult.toFixed();\n`
for (const name of ['a', 'b']) {
  files.set(
    `/workspace/${name}/tsconfig.json`,
    JSON.stringify({
      files: ['main.ts', 'value.ts'],
      compilerOptions: { allowImportingTsExtensions: true, noEmit: true, types: [] },
    }),
  )
  files.set(`/workspace/${name}/main.ts`, sourceText)
  files.set(`/workspace/${name}/value.ts`, 'export const value: number = 42;\n')
}
const part = (name) => `${sourceRoot}/packages/typescript-worker/src/parts/${name}/${name}.ts`
const source = `
import {createFileSystem} from ${JSON.stringify(part('CreateFileSystem'))}
import * as LanguageServices from ${JSON.stringify(part('LanguageServices'))}
import * as Services from ${JSON.stringify(part('GetOrCreateLanguageService'))}
import {commandMap} from ${JSON.stringify(part('CommandMap'))}
import * as ReadLibFile from ${JSON.stringify(part('ReadLibFile'))}
const sourceText = ${JSON.stringify(sourceText)};
const callSource = (method, ...args) => {
  const xhr = new XMLHttpRequest(); xhr.open('GET', '/rpc?value='+encodeURIComponent(JSON.stringify({method,args})),false); xhr.send();
  const result = JSON.parse(xhr.responseText); if (result.error) throw Error(result.error); return result.value;
}
let fs; let ts; let openUris = []; let initialized = false; const programs = new Map();
self.rpc = {invoke: async (method,...args) => method === 'DocumentLifecycle.getOpenUris' ? openUris : callSource(method,...args)};
const initialize = async () => {
  await ReadLibFile.initialize();
  ts = (await import('/node_modules/typescript/lib/typescript-esm.js')).ts;
  fs = createFileSystem(${baseline ? '' : "uri => callSource('SyncApi.readFileSync', uri)"});
  LanguageServices.set(1,fs,{invokeSync:callSource},ts); initialized = true;
};
self.onmessage = async ({data}) => {
  try {
    if (!initialized) await initialize();
    const uri = '/workspace/'+(data.project || 'a')+'/main.ts';
    let result;
    if (data.action === 'open') {
      if (!openUris.includes(uri)) openUris.push(uri);
      const text = callSource('SyncApi.readFileSync', uri);
      const document = {uri,text}; const start=performance.now();
      const diagnostics = await commandMap['Diagnostic.getDiagnostics'](document);
      const offset = text.indexOf('result.toFixed') + 'result.'.length;
      const completions = await commandMap['Completion.getCompletions'](document,offset);
      const definitions = await commandMap['Definition.getDefinition'](document,text.indexOf('value;'));
      const edits = await commandMap['Rename.rename'](document,text.indexOf('result:'), 'renamed');
      result = {latencyMs:performance.now()-start, diagnostics, completions, definitions, edits};
    } else if (data.action === 'inspect') {
      const services = ['a','b'].map(name => Services.getOrCreateLanguageService('/workspace/'+name+'/main.ts').languageService);
      result = {projects: Services.getProjectCount(), programs: services.map((service,index) => {
        const name = ['a','b'][index]; const program = service.getProgram();
        const previous = programs.get(name); programs.set(name,program);
        return {name, rebuilt: previous ? previous !== program : null, roots: program.getRootFileNames(), files: program.getSourceFiles().map(file=>file.fileName)};
      })};
    } else if (data.action === 'edit') {
      const text = sourceText.replace('result: number', 'result: string');
      const diagnostics = await commandMap['Diagnostic.getDiagnostics']({uri,text});
      result = {diagnostics};
    } else if (data.action === 'save') {
      const text = fs.readFile(uri);
      await fetch('/save?uri='+encodeURIComponent(uri),{method:'POST',body:text});
      result = {};
    } else if (data.action === 'close') {
      openUris = [];
      ${baseline ? '' : 'Services.collectIdleProjects(openUris,0,0);'}
      result = {overrides:fs.getScriptFileNames(),projects:${baseline ? '-1' : 'Services.getProjectCount()'}};
    } else if (data.action === 'dirty-recreate') {
      ${baseline ? '' : 'Services.collectIdleProjects([],0,0);'}
      const retainedText=fs.readFile(uri);
      const service=Services.getOrCreateLanguageService(uri).languageService;
      result={retainedText,codes:service.getSemanticDiagnostics(uri).map(item=>item.code)};
    }
    self.postMessage({result});
  } catch(error) {self.postMessage({error:String(error),stack:error.stack})}
}
`
const manifest = await getTypeScriptLibManifest(join(root, 'node_modules/typescript/lib'))
const output = await build({
  stdin: { contents: source, resolveDir: root, loader: 'ts' },
  external: ['/node_modules/*'],
  bundle: true,
  format: 'esm',
  write: false,
})
const worker = output.outputFiles[0].text.replaceAll(
  '"__TYPE_SCRIPT_LIB_MANIFEST__"',
  JSON.stringify(JSON.stringify(manifest)),
)
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://localhost')
    if (url.pathname === '/save') {
      let text = ''
      for await (const chunk of request) text += chunk
      files.set(url.searchParams.get('uri'), text)
      response.end('{}')
      return
    }
    if (url.pathname === '/rpc') {
      const { method, args } = JSON.parse(url.searchParams.get('value'))
      const uri = typeof args[0] === 'string' ? args[0].replace(/^file:\/\//, '').replace(/\/$/, '') : args[0]
      let value
      if (method === 'SyncApi.readFileSync' || method === 'FileSystem.readFile') value = files.get(uri)
      else if (method === 'SyncApi.exists')
        value = files.has(uri) || [...files.keys()].some((key) => key.startsWith(uri + '/'))
      else if (method === 'SyncApi.readDirSync')
        value = [
          ...new Set(
            [...files.keys()]
              .filter((key) => key.startsWith(uri + '/'))
              .map((key) => key.slice(uri.length + 1).split('/')[0]),
          ),
        ]
      else throw Error('Unexpected method ' + method)
      response.end(JSON.stringify({ value }))
      return
    }
    let content
    if (url.pathname === '/') content = '<html></html>'
    else if (url.pathname.endsWith('/benchmark.js')) content = worker
    else {
      const path = resolve(root, '.' + url.pathname)
      if (!path.startsWith(root + sep)) throw Error('Invalid path')
      content = await readFile(path)
    }
    response.setHeader('content-type', url.pathname === '/' ? 'text/html' : 'text/javascript')
    response.end(content)
  } catch (error) {
    response.end(JSON.stringify({ error: String(error) }))
  }
})
let app
try {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const main = join(temporary, 'main.cjs')
  await writeFile(
    main,
    `const {app,BrowserWindow}=require('electron'); app.whenReady().then(()=>new BrowserWindow({show:false,webPreferences:{sandbox:true}}).loadURL(process.argv.find(value=>value.startsWith('http://'))));`,
  )
  const profile = { ...process.env }
  for (const name of ['CONFIG', 'DATA', 'CACHE', 'STATE'])
    profile[`XDG_${name}_HOME`] = join(temporary, name.toLowerCase())
  app = await _electron.launch({
    executablePath: process.env.ELECTRON_PATH,
    args: [main, `http://127.0.0.1:${server.address().port}/`, `--user-data-dir=${join(temporary, 'chromium')}`],
    env: profile,
  })
  const page = await app.firstWindow({ timeout: 30_000 })
  await page.evaluate(() => {
    self.worker = new Worker('/packages/typescript-worker/dist/benchmark.js', { type: 'module' })
    self.request = (data) =>
      new Promise((resolve, reject) => {
        self.worker.onmessage = ({ data }) => (data.error ? reject(Error(JSON.stringify(data))) : resolve(data.result))
        self.worker.onerror = (event) => reject(Error(event.message))
        self.worker.postMessage(data)
      })
  })
  const request = (data) => page.evaluate((data) => self.request(data), data)
  const measure = async () =>
    app.evaluate(async ({ BrowserWindow }) => {
      const debug = BrowserWindow.getAllWindows()[0].webContents.debugger
      if (!debug.isAttached()) debug.attach('1.3')
      const { targetInfos } = await debug.sendCommand('Target.getTargets')
      const target = targetInfos.find((target) => target.type === 'worker' && target.url.endsWith('/benchmark.js'))
      if (!target) throw Error('Missing worker target')
      const { sessionId } = await debug.sendCommand('Target.attachToTarget', {
        targetId: target.targetId,
        flatten: true,
      })
      try {
        await debug.sendCommand('HeapProfiler.collectGarbage', {}, sessionId)
        return await debug.sendCommand('Runtime.getHeapUsage', {}, sessionId)
      } finally {
        await debug.sendCommand('Target.detachFromTarget', { sessionId })
      }
    })
  const validate = (result) => {
    assert.equal(result.diagnostics.length, 0, JSON.stringify(result.diagnostics))
    assert.ok(
      result.completions.some((item) => item.label === 'toFixed'),
      'missing completion',
    )
    assert.ok(result.definitions?.uri.endsWith('/value.ts'), 'missing definition')
    assert.ok(result.edits?.canRename && result.edits.edits.length > 0, 'missing rename edits')
  }
  validate(await request({ action: 'open', project: 'a' }))
  validate(await request({ action: 'open', project: 'b' }))
  const initial = await request({ action: 'inspect' })
  const open = await measure()
  const edit = await request({ action: 'edit', project: 'a' })
  assert.ok(edit.diagnostics.length > 0)
  const edited = await request({ action: 'inspect' })
  const afterEdit = await measure()
  if (!baseline) {
    assert.equal(initial.projects, 2)
    assert.deepEqual(initial.programs[0].roots, ['/workspace/a/main.ts', '/workspace/a/value.ts'])
    assert.deepEqual(initial.programs[1].roots, ['/workspace/b/main.ts', '/workspace/b/value.ts'])
    assert.equal(edited.programs[0].rebuilt, true)
    assert.equal(edited.programs[1].rebuilt, false)
  }
  const version = await app.evaluate(({ app }) => ({
    electron: process.versions.electron,
    chrome: process.versions.chrome,
  }))
  console.log(
    JSON.stringify(
      {
        baseline,
        sourceRoot,
        version,
        typescript: JSON.parse(await readFile(join(root, 'node_modules/typescript/package.json'), 'utf8')).version,
        initial,
        edited,
        open,
        afterEdit,
      },
      null,
      2,
    ),
  )
} finally {
  await app?.close()
  await new Promise((resolve) => server.close(resolve))
  await rm(temporary, { recursive: true, force: true })
}
