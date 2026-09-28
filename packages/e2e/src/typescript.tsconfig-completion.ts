import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.tsconfig-completion'

export const test: Test = async ({ Editor, expect, FileSystem, Locator, Main, Workspace }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/tsconfig.json`, '{\n  \n}')
  await Workspace.setPath(tmpDir)
  await Main.openUri(`${tmpDir}/tsconfig.json`)
  await Editor.setCursor(1, 2)

  // act
  await Editor.openCompletion()

  // assert
  const completions = Locator('#Completions')
  await expect(completions).toBeVisible()
  const completionItems = completions.locator('.EditorCompletionItem')
  await expect(completionItems.nth(0)).toHaveText('compilerOptions')
}
