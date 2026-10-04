import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.performance-trace-cache'

export const test: Test = async ({ Command, FileSystem, Main, Settings, Workspace }) => {
  const fixtureUrl = import.meta.resolve('../fixtures/performance-trace-cache')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  await Workspace.setPath(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': false })
  const uri = `${workspaceUrl}/src/main.ts`
  await Main.openUri(uri)
  const trace = (await Command.executeExtensionCommand('typescript.showPerformanceTrace')) as any
  if (trace.error || trace.diagnostics?.count !== 1) {
    throw new Error(`Unexpected diagnostics: ${JSON.stringify(trace)}`)
  }
  if (trace.languageService?.cache !== 'created') {
    throw new Error(`Expected a cold language service: ${JSON.stringify(trace)}`)
  }
  // Twenty project files resolve the same package. Count transport calls rather
  // than wall time so the regression is independent of browser and machine speed.
  if (!(trace.syncRpc?.callCount > 0 && trace.syncRpc.callCount < 200)) {
    throw new Error(`Repeated package lookups were not shared: ${JSON.stringify(trace.syncRpc)}`)
  }
}
