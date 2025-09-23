import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.rename'

export const skip = 1

export const test: Test = async ({ FileSystem, Workspace, Main, Editor, Command }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/rename').toString()
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(0, 4)

  // act
  await Editor.openRename()
  await Command.execute('EditorRename.handleInput', 'y', /* Script */ 2)
  await Command.execute('EditorRename.accept')

  // assert

  // TODO verify variable has been renamed
}
