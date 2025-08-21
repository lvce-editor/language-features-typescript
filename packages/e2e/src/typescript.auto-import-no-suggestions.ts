import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.auto-import-no-suggestions'

export const test: Test = async ({ FileSystem, Main, Editor, Locator, expect }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(
    `${tmpDir}/src/tsconfig.json`,
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
  await FileSystem.writeFile(`${tmpDir}/src/add.ts`, 'export const add = (a, b) => a + b')
  await FileSystem.writeFile(`${tmpDir}/src/test.ts`, 'let x = add')
  await Main.openUri(`${tmpDir}/src/test.ts`)
  await Editor.setCursor(0, 11)

  // act
  await Editor.openCompletion()

  // assert
  const suggest = Locator('[aria-label="Suggest"]')
  await expect(suggest).toBeVisible()
  await expect(suggest).toHaveText('No Suggestions')
}
