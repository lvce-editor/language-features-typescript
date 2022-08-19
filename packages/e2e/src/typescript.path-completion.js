test('typescript.completion', async () => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/test.ts`, "import './")
  await FileSystem.writeFile(
    `${tmpDir}/add.ts`,
    'export const add = (a, b) => a + b'
  )
  await Main.openUri(`${tmpDir}/test.ts`)
  await Editor.setCursor(0, 10)

  // act
  await Editor.openCompletion()

  // assert
  const completions = Locator('#Completions')
  await expect(completions).toBeVisible()
  const completionItems = completions.locator('.EditorCompletionItem')
  await expect(completionItems).toHaveCount(1)
  const completionItemOne = completionItems.nth(0)
  await expect(completionItemOne).toHaveText('add.js')
})
