test('typescript.brace-completion', async () => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir({ scheme: 'file' })
  console.log({ tmpDir })
  await Workspace.setPath(tmpDir)
  const tsServerPath = await FileSystem.createExecutable(`

const handleMessage = (message) => {
  console.log({message})
}
process.on('message', handleMessage)

setTimeout(()=>{}, 909090)
`)
  await Settings.update({
    'typescript.tsserverPath': tsServerPath,
  })
  await FileSystem.writeFile(`${tmpDir}/test.ts`, 'win')
  await Main.openUri(`${tmpDir}/test.ts`)
  await Editor.setCursor(0, 3)

  // act
  await Editor.executeBraceCompletion('{')

  // assert
  const editor = Locator('.Editor')
  await expect(editor).toHaveText('win{}')
})
