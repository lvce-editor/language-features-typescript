import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.references'

export const test: Test = async ({ FileSystem, Main, Editor, Locator, expect }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(
    `${tmpDir}/tsconfig.json`,
    JSON.stringify(
      {
        compilerOptions: {
          lib: ['esnext'],
          types: [],
        },
      },
      null,
      2,
    ),
  )
  await FileSystem.writeFile(
    `${tmpDir}/add.ts`,
    `export const add = () => {}
`,
  )
  await FileSystem.writeFile(
    `${tmpDir}/test.ts`,
    `import { add } from './not-found.ts'

add(1,2)
`,
  )
  await FileSystem.writeFile(`${tmpDir}/tsconfig.json`, `{}`)
  await Main.openUri(`${tmpDir}/test.ts`)
  await Editor.setCursor(2, 2)

  // act
  await Editor.findAllReferences()

  // assert
  const viewletError = Locator('.Viewlet.Error')
  await expect(viewletError).toBeVisible()
  await expect(viewletError).toHaveText('Error: File not found /workspace/not-found.ts')
}
