import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.completion-middle-identifier-keyboard'

// cspell:ignore Editorsitors
const initialText = 'class Main { static closeAllEditors() {} }\nMain.closeAllEditorsitors()'
const expectedText = 'class Main { static closeAllEditors() {} }\nMain.closeAllEditors()'

export const test: Test = async ({ Editor, expect, FileSystem, KeyBoard, Locator, Main, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  const uri = `${tmpDir}/main.ts`
  await FileSystem.writeFile(uri, initialText)
  await Workspace.setUri(tmpDir)
  await Main.openUri(uri)
  await Editor.setCursor(1, 'Main.closeAllEditors'.length)

  await Editor.openCompletion()
  const items = Locator('.EditorCompletionItem')
  await expect(items).toHaveText('closeAllEditors')
  await KeyBoard.press('Enter')

  await Editor.shouldHaveText(expectedText)
}
