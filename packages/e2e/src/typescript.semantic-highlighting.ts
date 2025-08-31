import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.semantic-highlighting'

export const skip = true

export const test: Test = async ({ FileSystem, Main, Locator, expect }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(
    `${tmpDir}/add.js`,
    `export const add = () => {}
`,
  )
  await FileSystem.writeFile(
    `${tmpDir}/test.js`,
    `import {add} from './add.js'

add(1,2)
`,
  )
  await FileSystem.writeFile(`${tmpDir}/tsconfig.json`, `{}`)

  // act
  await Main.openUri(`${tmpDir}/test.js`)

  // assert
  const rowTwo = Locator('.EditorRow').nth(2)
  const tokenAdd = rowTwo.locator('.Token', { hasText: 'add' })
  await expect(tokenAdd).toHaveClass('Token Function')
}
