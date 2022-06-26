import { expect } from '@playwright/test'
import { mkdtemp, writeFile } from 'fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'os'
import { runWithExtension, test } from '../src/runWithExtension.js'
import { TIMEOUT_LONG } from './_timeout.js'

const getTmpDir = () => {
  return mkdtemp(join(tmpdir(), 'typescript-implementations'))
}

test('typescript.implementations', async () => {
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

  const contextMenuItemFindAllImplementations = page.locator('.MenuItem', {
    hasText: 'Find all implementations',
  })
  await contextMenuItemFindAllImplementations.click()

  const viewletLocations = page.locator('.Viewlet[data-viewlet-id="Locations"]')
  await expect(viewletLocations).toBeVisible({
    timeout: TIMEOUT_LONG,
  })

  const viewletImplementationsMessage = page.locator('.LocationsMessage')
  await expect(viewletImplementationsMessage).toHaveText('1 result in 1 file')

  const referenceItems = viewletLocations.locator('.TreeItem')
  await expect(referenceItems).toHaveCount(2)

  const implementationItemOne = referenceItems.nth(0)
  await expect(implementationItemOne).toHaveText('add.js')
  const implementationItemTwo = referenceItems.nth(1)
  await expect(implementationItemTwo).toHaveText(`export const add = () => {}`)
})
