import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.toggle-block-comment'

export const test: Test = async ({ Settings, FileSystem, Workspace, Main, Editor }) => {
  // arrange
  await Settings.disableDiagnostics()
  const fixtureUrl = import.meta.resolve('../fixtures/toggle-block-comment')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setSelections([1, 0, 3, 0])

  // act
  await Editor.toggleBlockComment()

  // assert
  await Editor.shouldHaveText(`function example(){
/* const message = 'Hello World'
 *  return message
 */
}`)
}
