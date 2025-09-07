import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.implementations'

export const skip = true

export const test: Test = async ({ FileSystem, Main, Editor, Locator, expect }) => {
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
  await Editor.setCursor(0, 3)

  // act
  await Editor.findAllImplementations()

  // assert
  const viewletLocations = Locator('.Viewlet.Locations')
  await expect(viewletLocations).toBeVisible()
  const viewletImplementationsMessage = Locator('.LocationsMessage')
  await expect(viewletImplementationsMessage).toHaveText('1 result in 1 file')
  const referenceItems = viewletLocations.locator('.TreeItem')
  await expect(referenceItems).toHaveCount(2)
  const implementationItemOne = referenceItems.nth(0)
  await expect(implementationItemOne).toHaveText('add.js')
  const implementationItemTwo = referenceItems.nth(1)
  await expect(implementationItemTwo).toHaveText(`export const add = () => {}`)
}
