import {
  getTmpDir,
  runWithExtension,
  test,
} from '@lvce-editor/test-with-playwright'
import { expect } from '@playwright/test'
import { writeFile } from 'fs/promises'
import { TIMEOUT_LONG } from './_timeout.js'

test('typescript.references', async () => {
  const tmpDir = await getTmpDir()
  await writeFile(
    `${tmpDir}/add.js`,
    `export const add = () => {}
`
  )
  await writeFile(
    `${tmpDir}/test.js`,
    `import {add} from './add.js'

add(1,2)
`
  )
  await writeFile(`${tmpDir}/tsconfig.json`, `{}`)
  const page = await runWithExtension({
    folder: tmpDir,
  })
  const testJs = page.locator('text=test.js')
  await testJs.click()

  const token = page.locator('.Token').first()
  await token.click({
    button: 'right',
  })

  const contextMenuItemFindAllReferences = page.locator('.MenuItem', {
    hasText: 'Find all references',
  })
  await contextMenuItemFindAllReferences.click()

  const viewletLocations = page.locator('.Viewlet[data-viewlet-id="Locations"]')
  await expect(viewletLocations).toBeVisible({
    timeout: TIMEOUT_LONG,
  })

  const viewletReferencesMessage = page.locator('.LocationsMessage')
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
