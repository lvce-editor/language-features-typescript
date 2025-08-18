import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.toggle-line-comment'

export const test: Test = async ({ FileSystem, Main, Editor, Locator, expect }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/test.ts`, 'let x = 1')
  await Main.openUri(`${tmpDir}/test.ts`)
  await Editor.setCursor(0, 3)

  // act
  await Editor.toggleLineComment()

  // assert
  // TODO
}
