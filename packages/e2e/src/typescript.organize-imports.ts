import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.organize-imports'

// export const skip = true

export const test: Test = async ({ FileSystem, ContextMenu, Workspace, Main, Editor, Locator, expect, QuickPick }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/a.ts`, 'export const a = 1')
  await FileSystem.writeFile(`${tmpDir}/b.ts`, 'export const b = 2')
  await FileSystem.writeFile(
    `${tmpDir}/c.ts`,
    `import { b } from './b.ts'
import { a } from './a.ts'

export const c = a + 1`,
  )

  await Main.openUri(`${tmpDir}/c.ts`)

  // act
  await Editor.organizeImports()

  // assert
  // TODO verify that imports are organized
  // const text = await Editor.getText()
}
