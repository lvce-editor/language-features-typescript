import { expect } from '@playwright/test'
import { mkdtemp, writeFile } from 'fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'os'
import { runWithExtension, test } from '../src/runWithExtension.js'
import { TIMEOUT_LONG } from './_timeout.js'

const getTmpDir = () => {
  return mkdtemp(join(tmpdir(), 'typescript-brace-completion'))
}

test('typescript.brace-completion', async () => {
  const tmpDir = await getTmpDir()
  await writeFile(join(tmpDir, 'test.ts'), 'win')
  const page = await runWithExtension({
    folder: tmpDir,
  })
  const testTs = page.locator('text=test.ts')
  await testTs.click()
  const tokenText = page.locator('.Token.Text')
  await tokenText.click()
  const cursor = page.locator('.EditorCursor')
  await expect(cursor).toHaveCSS('top', '0px')
  await expect(cursor).toHaveCSS('left', '9px')

  await page.keyboard.press('End')
  await expect(cursor).toHaveCSS('top', '0px')
  await expect(cursor).toHaveCSS('left', '27px')

  await page.keyboard.type('{')
  const editor = page.locator('.Editor')
  await expect(editor).toHaveText('win{}', { timeout: TIMEOUT_LONG })
})
