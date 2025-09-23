import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.definition-same-file'

export const test: Test = async ({ FileSystem, Workspace, Main, Editor, Locator, expect }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/definition-same-file').toString()
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(2, 2)

  // act
  await Editor.goToDefinition()

  // assert
  const mainTabs = Locator('.MainTab')
  await expect(mainTabs).toHaveCount(1)
  const mainTabTwo = mainTabs.nth(0)
  await expect(mainTabTwo).toHaveText('test.ts')
  await Editor.shouldHaveSelections(new Uint32Array([0, 0, 0, 0]))
}
