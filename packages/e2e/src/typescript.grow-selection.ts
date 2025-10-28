import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.grow-selection'

export const test: Test = async ({ FileSystem, Workspace, Main, Editor }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/grow-selection')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(0, 3)

  // act
  await Editor.growSelection()

  // assert

  // @ts-ignore
  await Editor.shouldHaveSelections(new Uint32Array([0, 0, 1, 0]))
}
