import { expect } from '@playwright/test'
import { mkdtemp, writeFile } from 'fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'os'
import { runWithExtension, test } from '../src/runWithExtension.js'

const getTmpDir = () => {
  return mkdtemp(join(tmpdir(), 'typescript-definition'))
}

test.skip('typescript.definition', async () => {
  const tmpDir = await getTmpDir()
  await writeFile(join(tmpDir, 'test.ts'), 'window')
  const page = await runWithExtension({
    folder: tmpDir,
  })
  const testTs = page.locator('text=test.ts')
  await testTs.click()
  const tokenText = page.locator('.Token.Text')
  await tokenText.click({
    modifiers: ['Alt'],
  })

  const mainTabs = page.locator('.MainTab')
  await expect(mainTabs).toHaveCount(2)
  const mainTabTwo = mainTabs.nth(1)
  await expect(mainTabTwo).toHaveText('lib.dom.d.ts')

  const editor = page.locator('.Editor')
  await expect(editor).toContainText(
    `interface AddEventListenerOptions extends EventListenerOptions {`
  )
})
