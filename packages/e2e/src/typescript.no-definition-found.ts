import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.no-definition-found'

export const skip = 1

export const test: Test = async ({ FileSystem, Workspace, Main, Editor, Locator, expect }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/no-definition-found')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(0, 3)

  // act
  await Editor.goToDefinition()

  // assert
  const overlayMessage = Locator('.EditorOverlayMessage')
  await expect(overlayMessage).toBeVisible()
  await expect(overlayMessage).toHaveText(`No definition found for 'window'`)
}
