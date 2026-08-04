import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.definition'

export const test: Test = async ({ Editor, expect, FileSystem, Locator, Main, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/definition')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Editor.setCursor(0, 3)

  // act
  await Editor.goToDefinition()

  // assert
  const mainTabs = Locator('.MainTab')
  await expect(mainTabs).toHaveCount(2)
  const mainTabTwo = mainTabs.nth(1)
  await expect(mainTabTwo).toHaveText('lib.dom.d.ts')
  const editorError = Locator('.TextEditorError')
  await expect(editorError).toBeHidden()
  const editorContent = Locator('.EditorContent')
  await expect(editorContent).toBeVisible()
}
