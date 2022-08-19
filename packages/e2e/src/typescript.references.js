test('typescript.references', async () => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
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
  await ContextMenu.selectItem('Find all references')

  // assert
  const viewletLocations = Locator('.Viewlet[data-viewlet-id="Locations"]')
  await expect(viewletLocations).toBeVisible()
  const viewletReferencesMessage = Locator('.LocationsMessage')
  await expect(viewletReferencesMessage).toHaveText('3 results in 2 files')
  const referenceItems = viewletLocations.locator('.TreeItem')
  await expect(referenceItems).toHaveCount(5)
  const referenceItemOne = referenceItems.nth(0)
  await expect(referenceItemOne).toHaveText('test.js')
  const referenceItemTwo = referenceItems.nth(1)
  await expect(referenceItemTwo).toHaveText(`import {add} from './add.js'`)
  const referenceItemThree = referenceItems.nth(2)
  await expect(referenceItemThree).toHaveText(`add(1,2)`)
  const referenceItemFour = referenceItems.nth(3)
  await expect(referenceItemFour).toHaveText(`add.js`)
  const referenceItemFive = referenceItems.nth(4)
  await expect(referenceItemFive).toHaveText(`export const add = () => {}`)
})
