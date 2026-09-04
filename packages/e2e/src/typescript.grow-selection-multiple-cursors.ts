import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.grow-selection-multiple-cursors'

export const test: Test = async ({ Editor, FileSystem, Main, Workspace }) => {
  const fixtureUrl = import.meta.resolve('../fixtures/grow-selection')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setSelections(new Uint32Array([1, 26, 1, 26, 1, 32, 1, 32]))

  await Editor.growSelection()

  await Editor.shouldHaveSelections(new Uint32Array([1, 25, 1, 27, 1, 30, 1, 37]))
}
