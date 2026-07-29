import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.references-tsx'

export const test: Test = async ({ Editor, expect, FileSystem, Locator, Main, Workspace }) => {
  const fixtureUrl = import.meta.resolve('../fixtures/definition-tsx')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/main.tsx`)
  await Editor.setCursor(0, 8)

  await Editor.findAllReferences()

  const viewletLocations = Locator('.Locations')
  await expect(viewletLocations).toBeVisible()
  const viewletReferencesMessage = Locator('.LocationsMessage')
  await expect(viewletReferencesMessage).toHaveText('3 results in 2 files')
}
