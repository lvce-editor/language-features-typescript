export const name = 'typescript.completion'

export const test = async ({ FileSystem, Main, Editor, Locator, expect }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(
    `${tmpDir}/test.ts`,
    `let x = 1

export {}
`,
  )
  await Main.openUri(`${tmpDir}/test.ts`)
  await Editor.setCursor(0, 4)

  // act
  await Editor.openHover()

  // assert
  const hover = Locator('.HoverDisplayString')
  await expect(hover).toHaveText('let x: number')
}
