import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.rename'

export const test: Test = async ({ Workspace, Main, Editor, Command }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/rename').toString()
  const workspaceUrl = Workspace.resolveFileUrl(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(0, 4)

  // act
  await Editor.openRename()
  await Command.execute('EditorRename.handleInput', 'y', /* Script */ 2)
  await Command.execute('EditorRename.accept')

  // assert
  await Editor.shouldHaveText('let y = 1\n')
}
