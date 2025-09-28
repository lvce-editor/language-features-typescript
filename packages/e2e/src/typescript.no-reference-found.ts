import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.no-reference-found'

export const test: Test = async ({ FileSystem, Workspace, Main, Editor, Locator, expect }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/no-reference-found')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(2, 2)

  // act
  await Editor.findAllReferences()

  // assert
  const viewletLocations = Locator('.Locations')
  await expect(viewletLocations).toBeVisible()
  const viewletReferencesMessage = Locator('.LocationsMessage')
  await expect(viewletReferencesMessage).toHaveText('No Results')
}
