import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.performance-trace'

export const test: Test = async ({ Command, Editor, FileSystem, Main, Settings, Workspace }) => {
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  await Workspace.setPath(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': false })

  const uri = `${workspaceUrl}/src/multiple.ts`
  await Main.openUri(uri)

  const trace = (await Command.executeExtensionCommand('typescript.showPerformanceTrace')) as any

  if (trace.error) {
    throw new Error(`Unexpected trace error: ${JSON.stringify(trace.error)}`)
  }
  if (trace.file.uri !== uri) {
    throw new Error(`Expected trace for ${uri}, received ${trace.file.uri}`)
  }
  if (trace.diagnostics?.count !== 2) {
    throw new Error(`Unexpected trace diagnostics: ${JSON.stringify(trace)}`)
  }
  if (trace.commandDurationMs < trace.totalDurationMs) {
    throw new Error(`Unexpected command duration: ${JSON.stringify(trace)}`)
  }
  const outputDocument = await Command.execute('GetActiveEditor.getTextDocument')
  if (!/typescript-performance-trace-\d+\.json$/.test(outputDocument.uri) || outputDocument.uri.includes('?')) {
    throw new Error(`Expected a query-free JSON trace URI, received ${outputDocument.uri}`)
  }
  if ((await FileSystem.readFile(outputDocument.uri)) !== JSON.stringify(trace, null, 2)) {
    throw new Error('Expected the trace document to contain the pretty-printed performance trace')
  }
  await Editor.shouldHaveText(JSON.stringify(trace, null, 2))
  const warmTrace = (await Command.executeExtensionCommand('typescript.showPerformanceTrace', {
    text: await FileSystem.readFile(uri),
    uri,
  })) as any
  if (warmTrace.languageService?.cache !== 'reused') {
    throw new Error(`Expected warm trace, received ${JSON.stringify(warmTrace)}`)
  }
  const latestOutputDocument = await Command.execute('GetActiveEditor.getTextDocument')
  if (latestOutputDocument.uri === outputDocument.uri || latestOutputDocument.uri.includes('?')) {
    throw new Error(`Expected a fresh query-free trace URI, received ${latestOutputDocument.uri}`)
  }
  await Editor.shouldHaveText(JSON.stringify(warmTrace, null, 2))
  if ((await FileSystem.readFile(latestOutputDocument.uri)) !== JSON.stringify(warmTrace, null, 2)) {
    throw new Error('Expected the trace document to refresh with the latest performance trace')
  }
}
