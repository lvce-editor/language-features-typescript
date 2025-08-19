import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.completion-from-node-modules'

export const skip = 1

export const test: Test = async ({ FileSystem, Main, Editor, Locator, expect }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/test.ts`, `import * as _ from ''`)
  await Main.openUri(`${tmpDir}/test.ts`)
  await Editor.setCursor(0, 20)

  // act
  await Editor.openCompletion()

  // assert
  const completions = Locator('#Completions')
  await expect(completions).toBeVisible()
  const completionItems = completions.locator('.EditorCompletionItem')
  await expect(completionItems.nth(0)).toHaveText('PictureInPictureWindow')
}
