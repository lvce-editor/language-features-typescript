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
  await writeFile(join(tmpDir, 'test.ts'), 'win')
  const page = await runWithExtension({
    folder: tmpDir,
  })
  const testTs = page.locator('text=test.ts')
  await testTs.click()
  const tokenText = page.locator('.Token.Text')
  await tokenText.click()
  await page.keyboard.press('End')
  await page.keyboard.press('Control+Space')

  const completions = page.locator('#Completions')
  await expect(completions).toBeVisible()

  const completionItems = completions.locator('.EditorCompletionItem')
  const completionItemOne = completionItems.nth(0)
  await expect(completionItemOne).toHaveText('AbortController', {
    timeout: TIMEOUT_LONG,
  })
})
