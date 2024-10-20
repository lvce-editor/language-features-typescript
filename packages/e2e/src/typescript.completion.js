export const name = 'typescript.completion'

export const test = async ({ FileSystem, Workspace, Main, Editor, Locator, expect }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  // await FileSystem.writeFile(`${tmpDir}/test.ts`, 'win')
  await FileSystem.writeFile(`${tmpDir}/test.ts`, 'asser')
  await Main.openUri(`${tmpDir}/test.ts`)
  await Editor.setCursor(0, 5)

  // act
  await Editor.openCompletion()

  // assert
  const completions = Locator('#Completions')
  await expect(completions).toBeVisible()
  const completionItems = completions.locator('.EditorCompletionItem')
  await expect(completionItems.nth(0)).toHaveText('PictureInPictureWindow')
}
