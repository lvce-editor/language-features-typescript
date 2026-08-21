import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.grow-selection-statement'

export const test: Test = async ({ Editor, FileSystem, Main, Workspace }) => {
  const fixtureUrl = import.meta.resolve('../fixtures/grow-selection')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(1, 26)

  for (let i = 0; i < 5; i++) {
    await Editor.growSelection()
  }

  await Editor.shouldHaveSelections(new Uint32Array([1, 2, 1, 38]))
}
