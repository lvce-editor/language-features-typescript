import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.auto-fix-import'

// TODO enable when source-action widgets support isolated code-action providers
export const skip = 1

export const test: Test = async ({ Editor, expect, FileSystem, Locator, Main, Workspace }) => {
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
  // eslint-disable-next-line e2e/no-direct-click
  await organizeImportsAction.click()

  // assert

  // TODO verify that unused imports  have been removed
}
