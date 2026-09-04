import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.completion-import-folder'

export const test: Test = async ({ Editor, expect, FileSystem, Locator, Main }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(
    `${tmpDir}/tsconfig.json`,
    JSON.stringify(
      {
        compilerOptions: {
          lib: ['ESNext'],
          types: [],
        },
        include: ['add.ts', 'test.ts'],
      },
      null,
      2,
    ),
  )
  await FileSystem.writeFile(`${tmpDir}/add.ts`, `export const add = (a, b) => a + b`)
  await FileSystem.writeFile(`${tmpDir}/test.ts`, `import { add } from './'`)
  await Main.openUri(`${tmpDir}/test.ts`)
  await Editor.setCursor(0, 23)

  // act
  await Editor.openCompletion()

  // assert
  const completions = Locator('#Completions')
  await expect(completions).toBeVisible()
  const completionItems = completions.locator('.EditorCompletionItem')
  await expect(completionItems).toHaveCount(2)
  const firstCompletionItem = completionItems.nth(0)
  await expect(firstCompletionItem).toHaveText('tsconfig.json')
  const secondCompletionItem = completionItems.nth(1)
  await expect(secondCompletionItem).toHaveText('add.js') // TODO should be ts
}
