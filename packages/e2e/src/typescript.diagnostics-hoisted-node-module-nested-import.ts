import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics-hoisted-node-module-nested-import'

export const test: Test = async ({ Editor, FileSystem, Main, Settings, Workspace }) => {
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics-hoisted-node-modules')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true })

  const uri = `${workspaceUrl}/packages/running-extensions-view/src/parts/DisableWorkspace/side-effect-import.ts`
  await Main.openUri(uri)

  await Editor.shouldHaveDiagnostics([])
}
