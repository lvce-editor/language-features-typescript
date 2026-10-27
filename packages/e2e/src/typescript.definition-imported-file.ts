import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.definition-imported-file'

export const test: Test = async ({ Command, Editor, expect, FileSystem, Locator, Main, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/definition-imported-file')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setUri(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(2, 3)

  // act
  await Editor.goToDefinition()

  // assert
  const mainTabs = Locator('.MainTab')
  await expect(mainTabs).toHaveCount(2)
  const mainTabTwo = mainTabs.nth(1)
  await expect(mainTabTwo).toHaveText('add.ts')
  await Editor.shouldHaveSelections(new Uint32Array([1, 13, 1, 16]))

  // An ordinary reopen preserves the destination selection.
  await Main.openUri(`${workspaceUrl}/src/add.ts`)
  await Editor.shouldHaveSelections(new Uint32Array([1, 13, 1, 16]))

  // An active destination receives an explicit range too.
  await Editor.setCursor(0, 13)
  await Command.execute('Main.openUri', `${workspaceUrl}/src/add.ts`, true, {
    endColumnIndex: 16,
    endRowIndex: 1,
    startColumnIndex: 13,
    startRowIndex: 1,
  })
  await Editor.shouldHaveSelections(new Uint32Array([1, 13, 1, 16]))

  // Reopen from the preceding declaration to verify an existing tab gets the new location.
  await Main.openUri(`${workspaceUrl}/src/add.ts`)
  await Editor.setCursor(0, 13)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(2, 3)
  await Editor.goToDefinition()
  await Editor.shouldHaveSelections(new Uint32Array([1, 13, 1, 16]))

  // Definitions on the first row must also replace an existing selection.
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(4, 3)
  await Editor.goToDefinition()
  await Editor.shouldHaveSelections(new Uint32Array([0, 13, 0, 21]))
}
