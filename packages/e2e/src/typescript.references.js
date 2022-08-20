test('typescript.references', async () => {
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
  await Editor.setCursor(0, 9)

  // act
  await Editor.findAllReferences()

  // assert
  const viewletLocations = Locator('.Viewlet[data-viewlet-id="Locations"]')
  await expect(viewletLocations).toBeVisible()
  const viewletReferencesMessage = Locator('.LocationsMessage')
  await expect(viewletReferencesMessage).toHaveText('3 results in 2 files')
  const referenceItems = viewletLocations.locator('.TreeItem')
  await expect(referenceItems).toHaveCount(5)
  await expect(referenceItems.nth(0)).toHaveText('test.js')
  await expect(referenceItems.nth(1)).toHaveText(`import {add} from './add.js'`)
  await expect(referenceItems.nth(2)).toHaveText(`add(1,2)`)
  await expect(referenceItems.nth(3)).toHaveText(`add.js`)
  await expect(referenceItems.nth(4)).toHaveText(`export const add = () => {}`)
})
