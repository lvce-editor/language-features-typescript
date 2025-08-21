import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.grow-selection'

export const skip = 1

export const test: Test = async ({ FileSystem, Main, Editor, Command, expect }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/test.ts`, 'let x = 1')
  await Main.openUri(`${tmpDir}/test.ts`)
  await Editor.setCursor(0, 3)

  // act
  await Command.execute('Editor.selectionGrow')

  // assert

  // @ts-ignore
  await Editor.shouldHaveSelections(new Uint32Array([0, 0, 0, 9]))
}
