export const name = 'typescript.definition'

export const test = async ({ FileSystem, Main, Editor, Locator, expect }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/test.ts`, 'window')
  await Main.openUri(`${tmpDir}/test.ts`)
  await Editor.setCursor(0, 3)

  // act
  await Editor.goToDefinition()

  // assert
  const mainTabs = Locator('.MainTab')
  await expect(mainTabs).toHaveCount(2)
  const mainTabTwo = mainTabs.nth(1)
  await expect(mainTabTwo).toHaveText('lib.dom.d.ts')
}
