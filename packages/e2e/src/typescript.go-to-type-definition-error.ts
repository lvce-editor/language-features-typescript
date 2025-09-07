import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.go-to-type-definition-error'

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
    `${tmpDir}/test.ts`,
    `interface Abc {}

let abc: Abc = {}`,
  )
  await Main.openUri(`${tmpDir}/test.ts`)
  await Editor.setCursor(3, 4)

  // act
  await Editor.goToTypeDefinition()

  // assert
  const overlayMessage = Locator('.EditorOverlayMessage')
  await expect(overlayMessage).toBeVisible()
  await expect(overlayMessage).toHaveText(
    `Error: Failed to execute type definition provider: command not found TypeDefinition.getTypeDefinition`,
  )
}
