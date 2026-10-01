import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.hover'

export const test: Test = async ({ Editor, expect, FileSystem, Locator, Main, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/hover')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await FileSystem.writeFile(
    `${workspaceUrl}/src/test.ts`,
    '/** Documentation with undefined. */\nexport const hoverExample: string | undefined = undefined\n',
  )
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(1, 15)

  // act
  await Editor.openHover()

  // assert
  const hover = Locator('.EditorHover')
  const documentation = hover.locator('.HoverDocumentation')
  await expect(hover).toBeVisible()
  await expect(Locator('.EditorHover > .Sash')).toBeVisible()
  await expect(hover).toContainText('const hoverExample: string | undefined')
  await expect(documentation).toBeVisible()
  await expect(documentation).toContainText('Documentation with undefined.')
  await expect(hover).toHaveText('const hoverExample: string | undefinedDocumentation with undefined.\n')
}
