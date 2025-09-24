import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.auto-import-no-suggestions'

export const test: Test = async ({ Workspace, FileSystem, Main, Editor, Locator, expect }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/auto-fix-spelling').toString()
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await FileSystem.writeFile(`${workspaceUrl}/src/test.ts`, 'let x = add')
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(0, 11)

  // act
  await Editor.openCompletion()

  // assert
  const suggest = Locator('[aria-label="Suggest"]')
  await expect(suggest).toBeVisible()
  await expect(suggest).toHaveText('No Suggestions')
}
