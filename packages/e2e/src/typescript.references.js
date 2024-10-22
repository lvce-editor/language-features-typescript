export const name = 'typescript.references'

export const test = async ({ FileSystem, Main, Editor, Locator, expect }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(
    `${tmpDir}/add.ts`,
    `export const add = () => {}
`,
  )
  await FileSystem.writeFile(
    `${tmpDir}/test.ts`,
    `import { add } from './add.ts'

add(1,2)
`,
  )
  await FileSystem.writeFile(`${tmpDir}/tsconfig.json`, `{}`)
  await Main.openUri(`${tmpDir}/test.ts`)

  // act
  await Editor.findAllReferences()

  // assert
  const viewletLocations = Locator('.Locations')
  await expect(viewletLocations).toBeVisible()
  const viewletReferencesMessage = Locator('.LocationsMessage')
  // await expect(viewletReferencesMessage).toHaveText('3 results in 2 files') TODO
  const referenceItems = viewletLocations.locator('.TreeItem')
  // await expect(referenceItems).toHaveCount(5) TODO
  const referenceItemOne = referenceItems.nth(0)
  await expect(referenceItemOne).toHaveText('test.ts')
  const referenceItemTwo = referenceItems.nth(1)
  await expect(referenceItemTwo).toHaveText(`import { add } from './add.ts'`)
  const referenceItemThree = referenceItems.nth(2)
  // await expect(referenceItemThree).toHaveText(`add(1,2)`)// TODO
  // const referenceItemFour = referenceItems.nth(3)
  // await expect(referenceItemFour).toHaveText(`add.ts`)
  // const referenceItemFive = referenceItems.nth(4)
  // await expect(referenceItemFive).toHaveText(`export const add = () => {}`)
}
