import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.auto-import'

export const skip = 1

export const test: Test = async ({ FileSystem, Main, Editor }) => {
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
  await FileSystem.writeFile(`${tmpDir}/src/add.ts`, 'export const add = (a, b) => a + b')
  await FileSystem.writeFile(`${tmpDir}/src/test.ts`, 'let x = add')
  await Main.openUri(`${tmpDir}/src/test.ts`)
  await Editor.setCursor(0, 11)

  // act
  await Editor.openCompletion()

  // assert

  // TODO verify variable has been renamed
}
