test.skip('typescript.definition', async () => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/test.ts`, 'window')
  await Main.openUri(`${tmpDir}/test.ts`)

  // act
  await Editor.goToDefinition()

  // assert
  const mainTabs = Locator('.MainTab')
  await expect(mainTabs).toHaveCount(2)
  const mainTabTwo = mainTabs.nth(1)
  await expect(mainTabTwo).toHaveText('lib.dom.d.ts')

  const editor = Locator('.Editor')
  await expect(editor).toContainText(
    `interface AddEventListenerOptions extends EventListenerOptions {`
  )
})
