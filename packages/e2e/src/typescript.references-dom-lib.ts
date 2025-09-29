import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.references-dom-lib'

export const test: Test = async ({ FileSystem, Workspace, Main, Editor, Locator, expect }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/references-dom-lib')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(0, 2)

  // act
  await Editor.findAllReferences()

  // assert
  const viewletLocations = Locator('.Locations')
  await expect(viewletLocations).toBeVisible()
  const viewletReferencesMessage = Locator('.LocationsMessage')
  await expect(viewletReferencesMessage).toHaveText('2 results in 2 files')
  const referenceItems = viewletLocations.locator('.TreeItem')
  const referenceItemOne = referenceItems.nth(0)
  await expect(referenceItemOne).toHaveText('lib.dom.d.ts')
  const referenceItemThree = referenceItems.nth(2)
  await expect(referenceItemThree).toHaveText('test.ts')
  const referenceItemFour = referenceItems.nth(3)
  await expect(referenceItemFour).toHaveText(`window`)
}
