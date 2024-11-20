export const name = 'typescript.organize-imports'

export const skip = true

export const test = async ({ FileSystem, ContextMenu, Workspace, Main, Editor, Locator, expect, QuickPick }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/a.ts`, 'export const a = 1')
  await FileSystem.writeFile(`${tmpDir}/b.ts`, 'export const b = 2')
  await FileSystem.writeFile(
    `${tmpDir}/c.ts`,
    `import { a } from './a'
import { b } from './b'

export const c = a + 1`,
  )

  await Main.openUri(`${tmpDir}/c.ts`)

  // act
  await Editor.organizeImports()

  // assert
  const text = await Editor.getText()
  console.log({ text })
  // console.log({ ContextMenu })
  // await ContextMenu.show()

  // act
  // await QuickPick.open()
  // const quickPick = Locator('#QuickPick')
  // await expect(quickPick).toBeVisible()
  // const quickPickInput = quickPick.locator('input')
  // await expect(quickPickInput).toHaveValue('>')
  // await new Promise((r) => {
  //   setTimeout(r, 1000)
  // })
  // await QuickPick.setValue('> Organize Imports')
  // await Editor.openCompletion()

  // assert
  console.log({ Editor, QuickPick })
  // await expect(completions).toBeVisible()
  // const completionItems = completions.locator('.EditorCompletionItem')
  // await expect(completionItems.nth(0)).toHaveText('PictureInPictureWindow')
}
