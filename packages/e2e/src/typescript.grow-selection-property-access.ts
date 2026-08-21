import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.grow-selection-property-access'

export const test: Test = async ({ Editor, FileSystem, Main, Workspace }) => {
  const fixtureUrl = import.meta.resolve('../fixtures/grow-selection')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(1, 10)

  await Editor.growSelection()
  await Editor.shouldHaveSelections(new Uint32Array([1, 9, 1, 12]))

  await Editor.growSelection()
  await Editor.shouldHaveSelections(new Uint32Array([1, 9, 1, 16]))

  await Editor.growSelection()
  await Editor.shouldHaveSelections(new Uint32Array([1, 9, 1, 38]))
}
