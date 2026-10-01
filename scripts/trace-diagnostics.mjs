import { readFileSync, writeFileSync } from 'node:fs'

// Temporary CI instrumentation. Every replacement must match the pinned source once.
const patch = (path, before, after) => {
  const source = readFileSync(path, 'utf8')
  if (source.split(before).length !== 2) throw new Error(`Expected one diagnostic patch target in ${path}`)
  writeFileSync(path, source.replace(before, after))
}

const log = (stage, extra = '') =>
  `console.info('[typescript-diagnostic] ' + JSON.stringify({ stage: '${stage}', time: performance.timeOrigin + performance.now()${extra} }))`

const initialize = 'packages/typescript-worker/src/parts/Initialize/Initialize.ts'
patch(initialize, '  const tsPath = getTypeScriptPath()', `  ${log('initialize-start')}\n  const tsPath = getTypeScriptPath()`)
patch(initialize, '  void ReadLibFile.initialize()', `  ${log('typescript-loaded')}\n  void ReadLibFile.initialize()`)
patch(initialize, '  LanguageServices.set(id, fs, client, ts)', `  LanguageServices.set(id, fs, client, ts)\n  ${log('initialize-done')}`)

const provider = 'packages/extension/src/parts/ExtensionHost/ExtensionHostDiagnosticProviderTypeScript.ts'
patch(provider, '  const worker = await TypeScriptWorker.getInstance()', `  ${log('provider-start', ', uri: textDocument.uri')}\n  const worker = await TypeScriptWorker.getInstance()\n  ${log('provider-ready', ', uri: textDocument.uri')}`)

const diagnostics = 'packages/typescript-worker/src/parts/Diagnostics2/Diagnostics2.ts'
patch(diagnostics, '  const shouldCaptureFirstTrace =', `  ${log('compute-start', ', uri: textDocument.uri')}\n  const shouldCaptureFirstTrace =`)
patch(diagnostics, '      actualTrace.totalDurationMs = performance.now() - start', `      actualTrace.totalDurationMs = performance.now() - start\n      ${log('compute-done', ', uri: textDocument.uri, stages: actualTrace.stages, syncRpc: actualTrace.syncRpc, duration: actualTrace.totalDurationMs, count: actualTrace.diagnostics?.count')}`)

const runner = 'node_modules/@lvce-editor/test-with-playwright-worker/dist/workerMain.js'
patch(runner, '    const tests = await getTests(testSrc);\n    await runWithJavascriptCoverage({', `    page.on('console', message => {\n      if (message.text().startsWith('[typescript-diagnostic]')) console.log(message.text());\n    });\n    const tests = await getTests(testSrc);\n    await runWithJavascriptCoverage({`)
patch(runner, '    if (rendererWorkerTraceDirectory) {\n      await exportTrace({', `    if (result.status === Fail$1) await page.waitForTimeout(5000);\n    if (rendererWorkerTraceDirectory) {\n      await exportTrace({`)

patch('packages/typescript-worker/src/parts/ReadLibFile/ReadLibFile.ts', '    libCache = await TypeScriptLibCache.initialize(TypeScriptLibCache.getManifest())', `    libCache = await TypeScriptLibCache.initialize(TypeScriptLibCache.getManifest())\n    ${log('libs-ready')}`)
