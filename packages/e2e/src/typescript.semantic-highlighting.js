test('typescript.semantic-highlighting', async () => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir({ scheme: 'file' })
  await FileSystem.writeFile(
    `${tmpDir}/add.js`,
    `export const add = () => {}
`
  )
  await FileSystem.writeFile(
    `${tmpDir}/test.js`,
    `import {add} from './add.js'

add(1,2)
`
  )
  await FileSystem.writeFile(`${tmpDir}/tsconfig.json`, `{}`)
  await Main.openUri(`${tmpDir}/test.js`)

  const rowTwo = Locator('.EditorRow').nth(2)
  const tokenAdd = rowTwo.locator('.Token', { hasText: 'add' })
  await expect(tokenAdd).toHaveClass('Token Function')
})
