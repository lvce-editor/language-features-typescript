export const name = 'typescript.jsx-closing-tag'

export const skip = true

export const test = async ({
  FileSystem,
  Workspace,
  Main,
  Editor,
  Locator,
  expect,
}) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(
    `${tmpDir}/button.tsx`,
    `const button = () => {
  return <div
}
`
  )
  await FileSystem.writeFile(`${tmpDir}/tsconfig.json`, `{}`)
  await Editor.setCursor(1, 13)

  // act
  await Editor.typeWithAutoClosingTag('>')

  // assert
  // TODO
  // await expect(rowTwo).toHaveText('return <div></div>')
}
