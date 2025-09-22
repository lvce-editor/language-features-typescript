import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.references-node-module'

export const skip = 1

export const test: Test = async ({ Workspace, Main, Editor, Locator, expect }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/references-node-module').toString()
  const workspaceUrl = Workspace.resolveFileUrl(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(2, 2)

  // act
  await Editor.findAllReferences()

  // assert
  const viewletLocations = Locator('.Locations')
  await expect(viewletLocations).toBeVisible()
  const viewletReferencesMessage = Locator('.LocationsMessage')
  await expect(viewletReferencesMessage).toHaveText('4 results in 2 files')
  const referenceItems = viewletLocations.locator('.TreeItem')
  const referenceItemOne = referenceItems.nth(0)
  await expect(referenceItemOne).toHaveText('test.ts')
  const referenceItemTwo = referenceItems.nth(1)
  await expect(referenceItemTwo).toHaveText(`import { add } from './add.ts'`)
}
