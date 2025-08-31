import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.path-completion'

export const skip = true

export const test: Test = async ({ FileSystem, Main, Editor, Locator, expect }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir({ scheme: '' })
  await FileSystem.writeFile(`${tmpDir}/test.ts`, "import './")
  await FileSystem.writeFile(`${tmpDir}/add.ts`, 'export const add = (a, b) => a + b')
  await Main.openUri(`${tmpDir}/test.ts`)
  await Editor.setCursor(0, 19)

  // act
  await Editor.openCompletion()

  // assert
  const completions = Locator('#Completions')
  await expect(completions).toBeVisible()
  const completionItems = completions.locator('.EditorCompletionItem')
  await expect(completionItems).toHaveCount(1)
  const completionItemOne = completionItems.nth(0)
  await expect(completionItemOne).toHaveText('add.js')
}
