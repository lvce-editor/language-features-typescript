import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.go-to-type-definition-error'

// TODO enable when type definition is implemented by the TypeScript worker
export const skip = 1

export const test: Test = async ({ Editor, expect, FileSystem, Locator, Main, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/go-to-type-definition-error')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(3, 4)

  // act
  await Editor.goToTypeDefinition()

  // assert
  const overlayMessage = Locator('.EditorOverlayMessage')
  await expect(overlayMessage).toBeVisible()
  await expect(overlayMessage).toHaveText(
    `Error: Failed to execute type definition provider: command not found TypeDefinition.getTypeDefinition`,
  )
}
