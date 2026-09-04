import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.grow-selection-type-annotation'

export const test: Test = async ({ Editor, FileSystem, Main, Workspace }) => {
  const fixtureUrl = import.meta.resolve('../fixtures/grow-selection')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(0, 19)

  await Editor.growSelection()
  await Editor.shouldHaveSelections(new Uint32Array([0, 17, 0, 23]))

  await Editor.growSelection()
  await Editor.shouldHaveSelections(new Uint32Array([0, 13, 0, 23]))

  await Editor.growSelection()
  await Editor.shouldHaveSelections(new Uint32Array([0, 13, 0, 40]))
}
