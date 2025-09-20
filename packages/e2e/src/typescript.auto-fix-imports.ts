import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.auto-fix-import'

export const test: Test = async ({ Workspace, Main, Editor, Locator, expect }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/auto-fix-imports').toString()
  const workspaceUrl = Workspace.resolveFileUrl(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(0, 11)

  // act
  await Editor.openSourceActions()

  // assert
  const organizeImportsAction = Locator('.SourceActionItem', { hasText: 'Organize Imports' })
  await expect(organizeImportsAction).toBeVisible()
  await organizeImportsAction.click()

  // assert

  // TODO verify that unused imports  have been removed
}
