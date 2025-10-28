import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.rename'

export const test: Test = async ({ EditorRename, FileSystem, Workspace, Main, Editor }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/rename')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(0, 4)

  // act
  await Editor.openRename()
  await EditorRename.handleInput('y')
  await EditorRename.accept()

  // assert
  await Editor.shouldHaveText('let y = 1\n')
}
