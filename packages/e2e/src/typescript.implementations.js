test.skip('typescript.implementations', async () => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir({ scheme: 'file' })
  await Workspace.setPath(tmpDir)
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

  // act
  await Editor.openEditorContextMenu()
  await ContextMenu.selectItem('Find All Implementations')

  // assert
  const viewletLocations = Locator('.Viewlet[data-viewlet-id="Locations"]')
  await expect(viewletLocations).toBeVisible()
  const viewletImplementationsMessage = Locator('.LocationsMessage')
  await expect(viewletImplementationsMessage).toHaveText('1 result in 1 file')
  const referenceItems = viewletLocations.locator('.TreeItem')
  await expect(referenceItems).toHaveCount(2)
  const implementationItemOne = referenceItems.nth(0)
  await expect(implementationItemOne).toHaveText('add.js')
  const implementationItemTwo = referenceItems.nth(1)
  await expect(implementationItemTwo).toHaveText(`export const add = () => {}`)
})

export {}
