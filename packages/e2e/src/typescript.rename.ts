import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.rename'

export const skip = 1

export const test: Test = async ({ FileSystem, Main, Editor, Locator, Command, KeyBoard }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/test.ts`, 'let x = 1')
  await Main.openUri(`${tmpDir}/test.ts`)
  await Editor.setCursor(0, 4)

  // act
  await Editor.openRename()
  await Command.execute('EditorRename.handleInput', 'y', /* Script */ 2)
  await Command.execute('EditorRename.accept')

  // assert

  // TODO verify variable has been renamed
}
