import { expect } from '@playwright/test'
import { mkdtemp, writeFile } from 'fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'os'
import { runWithExtension, test } from '../src/runWithExtension.js'
import { TIMEOUT_LONG } from './_timeout.js'

const getTmpDir = () => {
  return mkdtemp(join(tmpdir(), 'typescript-completion'))
}

test('typescript.completion', async () => {
  const tmpDir = await getTmpDir()
  await writeFile(`${tmpDir}/test.ts`, "import './")
  await writeFile(`${tmpDir}/add.ts`, 'export const add = (a, b) => a + b')
  const page = await runWithExtension({
    folder: tmpDir,
  })
  const testTs = page.locator('text=test.ts')
  await testTs.click()
  const token = page.locator('.Token').first()
  await token.click()
  const cursor = page.locator('.EditorCursor')
  await expect(cursor).toHaveCount(1)
  await expect(cursor).toHaveCSS('top', '0px')
  await expect(cursor).toHaveCSS('left', '27px')

  await page.keyboard.press('End')
  await expect(cursor).toHaveCSS('left', '90px')

  await page.keyboard.press('Control+Space')

  const completions = page.locator('#Completions')
  await expect(completions).toBeVisible({ timeout: TIMEOUT_LONG })
  const completionItems = completions.locator('.EditorCompletionItem')
  await expect(completionItems).toHaveCount(1)
  const completionItemOne = completionItems.nth(0)
  await expect(completionItemOne).toHaveText('add.js')
})
