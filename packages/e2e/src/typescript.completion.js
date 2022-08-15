import {
  expect,
  getTmpDir,
  runWithExtension,
  test,
} from '@lvce-editor/test-with-playwright'
import { writeFile } from 'fs/promises'
import { join } from 'node:path'
import { TIMEOUT_LONG } from './_timeout.js'

test.skip('typescript.completion', async () => {
  const tmpDir = await getTmpDir()
  await writeFile(join(tmpDir, 'test.ts'), 'win')
  const page = await runWithExtension({
    folder: tmpDir,
  })
  const testTs = page.locator('text=test.ts')
  await testTs.click()
  const tokenText = page.locator('.Token').first()
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
