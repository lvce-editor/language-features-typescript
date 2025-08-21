import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.completion-import'

export const skip = 1

export const test: Test = async ({ FileSystem, Main, Editor, Locator, expect }) => {
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
        include: ['src'],
      },
      null,
      2,
    ),
  )
  await FileSystem.writeFile(`${tmpDir}/src/add.ts`, `export const add = (a, b) => a + b`)
  await FileSystem.writeFile(`${tmpDir}/src/test.ts`, `import { add } from './'`)
  await Main.openUri(`${tmpDir}/src/test.ts`)
  await Editor.setCursor(0, 23)

  // act
  await Editor.openCompletion()

  // assert
  const completions = Locator('#Completions')
  await expect(completions).toBeVisible()
  const completionItems = completions.locator('.EditorCompletionItem')
  await expect(completionItems).toHaveCount(1)
  await expect(completionItems.nth(0)).toHaveText('add.js') // TODO should be ts
}
