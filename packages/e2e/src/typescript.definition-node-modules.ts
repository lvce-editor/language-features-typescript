import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.definition-node-modules'

export const test: Test = async ({ Workspace, Main, Editor, Locator, expect }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/definition-node-modules').toString()
  const workspaceUrl = Workspace.resolveFileUrl(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(2, 3)

  // act
  await Editor.goToDefinition()

  // assert
  const mainTabs = Locator('.MainTab')
  await expect(mainTabs).toHaveCount(2)
  const mainTabTwo = mainTabs.nth(1)
  await expect(mainTabTwo).toHaveText('index.d.ts')
}
