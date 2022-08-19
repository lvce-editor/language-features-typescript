test.skip('typescript.jsx-closing-tag', async () => {
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
  await Main.openUri(`${tmpDir}/button.tsx`)
  await Editor.setCursor(1, 13)

  // act
  await Editor.type('>')

  // TODO
  // await expect(rowTwo).toHaveText('return <div></div>')
})
