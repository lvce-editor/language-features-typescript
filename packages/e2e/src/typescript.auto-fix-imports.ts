import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.auto-fix-import'

export const test: Test = async ({ FileSystem, Workspace, Main, Editor, Locator, expect }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/auto-fix-imports')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(0, 11)

  // act
  await Editor.openSourceActions()

  // assert
  const organizeImportsAction = Locator('.SourceActionItem', { hasText: 'Organize Imports' })
  await expect(organizeImportsAction).toBeVisible()
  // @ts-ignore
  await organizeImportsAction.click()

  // assert

  // TODO verify that unused imports  have been removed
}
