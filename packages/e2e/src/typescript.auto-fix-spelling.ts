import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.auto-fix-spelling'

export const test: Test = async ({ Command, Editor, expect, FileSystem, Locator, Main, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/auto-fix-spelling')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(0, 28)

  // act
  await Editor.openSourceActions()

  // assert
  const sourceActions = Locator('.EditorSourceActions')
  await expect(sourceActions).toBeVisible()

  const changeSpellingItem = Locator('.SourceActionItem', {
    hasText: `Change spelling to 'abort'`,
  })
  await expect(changeSpellingItem).toBeVisible()

  // act
  await Command.execute('EditorSourceAction.selectItem', "Change spelling to 'abort'")

  // assert
  await Editor.shouldHaveText(`globalThis.AbortSignal.abort()`)
}
