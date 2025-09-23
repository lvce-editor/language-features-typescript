import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.grow-selection'

export const skip = 1

export const test: Test = async ({ FileSystem, Workspace, Main, Editor, Command }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/grow-selection').toString()
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(0, 3)

  // act
  await Command.execute('Editor.selectionGrow')

  // assert

  // @ts-ignore
  await Editor.shouldHaveSelections(new Uint32Array([0, 0, 0, 9]))
}
