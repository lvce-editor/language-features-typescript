import {
  getTmpDir,
  runWithExtension,
  test,
} from '@lvce-editor/test-with-playwright'
import { expect } from '@playwright/test'
import { writeFile } from 'fs/promises'
import { TIMEOUT_LONG } from './_timeout.js'

test('typescript.completion', async () => {
  const tmpDir = await getTmpDir()
  await writeFile(`${tmpDir}/test.ts`, "import './")
  await writeFile(`${tmpDir}/add.ts`, 'export const add = (a, b) => a + b')
  const page = await runWithExtension({
    folder: tmpDir,
  })
  const testTs = page.locator('text=test.ts')
  await testTs.click()
  const row = page.locator('.EditorRow').first()
  await row.click()
  const cursor = page.locator('.EditorCursor')
  await expect(cursor).toHaveCount(1)
  await expect(cursor).toHaveCSS('top', '0px')
  await expect(cursor).toHaveCSS('left', '90px')

  await page.keyboard.press('Control+Space')

  const completions = page.locator('#Completions')
  await expect(completions).toBeVisible({ timeout: TIMEOUT_LONG })
  const completionItems = completions.locator('.EditorCompletionItem')
  await expect(completionItems).toHaveCount(1)
  const completionItemOne = completionItems.nth(0)
  await expect(completionItemOne).toHaveText('add.js')
})
