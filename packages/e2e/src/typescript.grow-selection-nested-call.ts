import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.grow-selection-nested-call'

export const test: Test = async ({ Editor, FileSystem, Main, Workspace }) => {
  const fixtureUrl = import.meta.resolve('../fixtures/grow-selection')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(1, 26)

  await Editor.growSelection()
  await Editor.growSelection()
  await Editor.shouldHaveSelections(new Uint32Array([1, 17, 1, 28]))

  await Editor.growSelection()
  await Editor.shouldHaveSelections(new Uint32Array([1, 17, 1, 37]))

  await Editor.growSelection()
  await Editor.shouldHaveSelections(new Uint32Array([1, 9, 1, 38]))
}
