test.skip('typescript.brace-completion', async () => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir({ scheme: 'file' })
  await Workspace.setPath(tmpDir)
  await FileSystem.writeFile(`${tmpDir}/test.ts`, 'win')
  await Main.openUri(`${tmpDir}/test.ts`)
  await Editor.setCursor(0, 3)

  // act
  await Editor.executeBraceCompletion('{')

  // assert
  const editor = Locator('.Editor')
  await expect(editor).toHaveText('win{}')
})
