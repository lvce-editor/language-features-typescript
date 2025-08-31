export const name = 'typescript.references-empty'

export const test = async ({ FileSystem, Main, Editor, Locator, expect }) => {
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
  await Editor.setCursor(1, 0)

  // act
  await Editor.findAllReferences()

  // assert
  const viewletLocations = Locator('.Locations')
  await expect(viewletLocations).toBeVisible()
  const viewletReferencesMessage = Locator('.LocationsMessage')
  await expect(viewletReferencesMessage).toHaveText('No Results')
}
