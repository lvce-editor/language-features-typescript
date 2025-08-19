import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.rename'

export const skip = 1

export const test: Test = async ({ FileSystem, Main, Editor, Locator, expect, KeyBoard }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/test.ts`, 'let x = 1')
  await Main.openUri(`${tmpDir}/test.ts`)
  await Editor.setCursor(0, 4)

  // act
  await Editor.openRename()

  // assert
  // TODO use page object
  const renameInput = Locator('.RenameInputBox')
  await renameInput.type('y')
  await KeyBoard.press('Enter')
}
