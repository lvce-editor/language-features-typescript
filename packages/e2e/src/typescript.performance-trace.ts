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
  await Editor.shouldHaveText(JSON.stringify(trace, null, 2))
  const warmTrace = (await Command.executeExtensionCommand('typescript.showPerformanceTrace', {
    text: await FileSystem.readFile(uri),
    uri,
  })) as any
  if (warmTrace.languageService?.cache !== 'reused') {
    throw new Error(`Expected warm trace, received ${JSON.stringify(warmTrace)}`)
  }
}
