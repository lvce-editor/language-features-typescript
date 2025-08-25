import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.auto-fix-import'

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
  await FileSystem.writeFile(`${tmpDir}/src/test.ts`, `import {add, subtract} from './math.ts'`)
  await Main.openUri(`${tmpDir}/src/test.ts`)
  await Editor.setCursor(0, 11)

  // act
  await Editor.openSourceActions()

  // assert
  const organizeImportsAction = Locator('.SourceActionItem', { hasText: 'Organize Imports' })
  await expect(organizeImportsAction).toBeVisible()
  await organizeImportsAction.click()

  // assert

  // TODO verify that unused imports  have been removed
}
