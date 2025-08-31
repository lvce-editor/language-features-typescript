import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.references'

export const test: Test = async ({ FileSystem, Main, Editor, Locator, expect }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(
    `${tmpDir}/tsconfig.json`,
    JSON.stringify(
      {
        compilerOptions: {
          lib: ['esnext'],
          types: [],
        },
      },
      null,
      2,
    ),
  )
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
  await Editor.setCursor(2, 2)

  // act
  await Editor.findAllReferences()

  // assert
  const viewletLocations = Locator('.Locations')
  await expect(viewletLocations).toBeVisible()
  const viewletReferencesMessage = Locator('.LocationsMessage')
  await expect(viewletReferencesMessage).toHaveText('3 results in 2 files')
  const referenceItems = viewletLocations.locator('.TreeItem')
  const referenceItemOne = referenceItems.nth(0)
  await expect(referenceItemOne).toHaveText('test.ts')
  const referenceItemTwo = referenceItems.nth(1)
  await expect(referenceItemTwo).toHaveText(`import { add } from './add.ts'`)
}
