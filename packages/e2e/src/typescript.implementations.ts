import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.implementations'

export const test: Test = async ({ Editor, expect, FileSystem, Locator, Main, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/implementations')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setUri(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(0, 9)

  // act
  await Editor.findAllImplementations()

  // assert
  const viewletLocations = Locator('.Viewlet.Locations')
  await expect(viewletLocations).toBeVisible()
  const viewletImplementationsMessage = Locator('.LocationsMessage')
  await expect(viewletImplementationsMessage).toHaveText('1 result in 1 file')
  const implementationItems = viewletLocations.locator('.TreeItem')
  await expect(implementationItems).toHaveCount(2)
  const implementationItemOne = implementationItems.nth(0)
  await expect(implementationItemOne).toHaveText('add.ts')
  const implementationItemTwo = implementationItems.nth(1)
  await expect(implementationItemTwo).toHaveText(`export const add = () => {}`)
}
