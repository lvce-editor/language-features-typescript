import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.brace-completion'

export const skip = true

export const test: Test = async ({ FileSystem, Workspace, Main, Editor }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/test.ts`, 'win')
  await Workspace.setPath(tmpDir)
  await Main.openUri(`${tmpDir}/test.ts`)
  await Editor.setCursor(0, 0)
  // TODO
}
