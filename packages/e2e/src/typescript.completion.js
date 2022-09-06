test('typescript.completion', async () => {
  const tsserverPath = await FileSystem.createExecutable(`
  console.log(process.argv)

  setTimeout(()=>{}, 10000000)
  // process.exit(1)
  `)
  // arrange
  await Settings.update({
    'typescript.tsserverPath': tsserverPath,
  })
  const tmpDir = await FileSystem.getTmpDir({ scheme: 'file' })
  await FileSystem.writeFile(`${tmpDir}/test.ts`, 'win')
  await Main.openUri(`${tmpDir}/test.ts`)
  await Editor.setCursor(0, 3)

  // act
  await Editor.openCompletion()

  // assert
  const completions = Locator('#Completions')
  await expect(completions).toBeVisible()
  const completionItems = completions.locator('.EditorCompletionItem')
  await expect(completionItems.nth(0)).toHaveText('AbortController')
})
