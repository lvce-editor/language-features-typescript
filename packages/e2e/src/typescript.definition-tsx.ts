import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.definition-tsx'

export const test: Test = async ({ Editor, expect, FileSystem, Locator, Main, Workspace }) => {
  const fixtureUrl = import.meta.resolve('../fixtures/definition-tsx')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/main.tsx`)
  await Editor.setCursor(0, 8)

  await Editor.goToDefinition()

  const mainTabs = Locator('.MainTab')
  await expect(mainTabs).toHaveCount(2)
  await expect(mainTabs.nth(1)).toHaveText('App.tsx')
}
