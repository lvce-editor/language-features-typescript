import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.auto-fix-spelling'

export const skip = 1

export const test: Test = async ({ Workspace, Main, Editor, Locator, expect }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/auto-fix-spelling').toString()
  const workspaceUrl = Workspace.resolveFileUrl(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(0, 11)

  // act
  await Editor.openSourceActions()

  // assert
  const sourceActions = Locator('.EditorSourceActions')
  await expect(sourceActions).toHaveVisible()

  const changeSpellingItem = Locator('.SourceActionItem', {
    hasText: `Change Spelling to 'abort'`,
  })
  await expect(changeSpellingItem).toBeVisible()

  // act
  await changeSpellingItem.click()

  // assert
  await Editor.shouldHaveText(`globalThis.AbortSignal.abort()`)
}
