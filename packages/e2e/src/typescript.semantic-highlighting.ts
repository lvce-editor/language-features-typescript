import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.semantic-highlighting'

export const skip = true

export const test: Test = async ({ expect, FileSystem, Locator, Main, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/semantic-highlighting')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)

  // act
  await Main.openUri(`${workspaceUrl}/src/test.js`)

  // assert
  const rowTwo = Locator('.EditorRow').nth(2)
  // @ts-ignore
  const tokenAdd = rowTwo.locator('.Token', { hasText: 'add' })
  await expect(tokenAdd).toHaveClass('Token Function')
}
