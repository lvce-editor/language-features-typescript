import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.auto-fix-spelling'

export const skip = 1

export const test: Test = async ({ FileSystem, Main, Editor, Locator, expect }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(
    `${tmpDir}/src/tsconfig.json`,
    JSON.stringify(
      {
        compilerOptions: {
          lib: ['esnext'],
          module: 'NodeNext',
          types: [],
        },
        include: ['test.ts'],
      },
      null,
      2,
    ),
  )
  await FileSystem.writeFile(`${tmpDir}/src/test.ts`, 'globalThis.AbortSignal.abort()')
  await Main.openUri(`${tmpDir}/src/test.ts`)
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
