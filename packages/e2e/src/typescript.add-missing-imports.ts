import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.add-missing-imports'

export const skip = true

export const test: Test = async ({ FileSystem, Main, Editor }) => {
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
}
