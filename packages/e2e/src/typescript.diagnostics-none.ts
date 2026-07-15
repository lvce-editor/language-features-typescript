import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics-none'

export const test: Test = async ({ Editor, FileSystem, Main, Settings, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true })

  // act
  await Main.openUri(`${workspaceUrl}/src/valid.ts`)

  // assert
  await Editor.shouldHaveDiagnostics([])
}
