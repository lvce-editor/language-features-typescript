import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.shrink-selection'

export const test: Test = async ({ Command, Editor, FileSystem, Main, Workspace }) => {
  const fixtureUrl = import.meta.resolve('../fixtures/grow-selection')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(1, 26)
  for (let i = 0; i < 4; i++) {
    await Editor.growSelection()
  }

  await Command.execute('Editor.cursorUndo')
  await Editor.shouldHaveSelections(new Uint32Array([1, 17, 1, 37]))

  await Command.execute('Editor.cursorUndo')
  await Editor.shouldHaveSelections(new Uint32Array([1, 17, 1, 28]))

  await Command.execute('Editor.cursorUndo')
  await Editor.shouldHaveSelections(new Uint32Array([1, 25, 1, 27]))

  await Command.execute('Editor.cursorUndo')
  await Editor.shouldHaveSelections(new Uint32Array([1, 26, 1, 26]))
}
