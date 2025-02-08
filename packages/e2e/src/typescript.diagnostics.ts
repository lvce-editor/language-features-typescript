export const name = 'typescript.diagnostics'

export const test = async ({ FileSystem, Main, Editor, Locator, expect }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(
    `${tmpDir}/test.ts`,
    `let x = 1

x = 'a'`,
  )
  await Main.openUri(`${tmpDir}/test.ts`)

  // act
  // TODO
  // 1. run diagnostics
  // 2. validate diagnostics are as expected
}
