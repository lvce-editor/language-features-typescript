import { expect } from '@playwright/test'
import { mkdtemp, writeFile } from 'fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'os'
import { runWithExtension, test } from '../src/runWithExtension.js'
import { TIMEOUT_LONG } from './_timeout.js'

const getTmpDir = () => {
  return mkdtemp(join(tmpdir(), 'typescript-jsx-closing-tag'))
}

test('typescript.jsx-closing-tag', async () => {
  const tmpDir = await getTmpDir()
  await writeFile(
    `${tmpDir}/button.tsx`,
    `const button = () => {
  return <div
}
`
  )
  await writeFile(`${tmpDir}/tsconfig.json`, `{}`)
  const page = await runWithExtension({
    folder: tmpDir,
  })
  const buttonTsx = page.locator('text=button.tsx')
  await buttonTsx.click()

  const rowTwo = page.locator('.EditorRow').nth(1)
  const token = rowTwo.locator('.Token').first()
  await token.click()

  const cursor = page.locator('.EditorCursor')
  await expect(cursor).toHaveCSS('top', '20px')
  await expect(cursor).toHaveCSS('left', '54px')

  await page.keyboard.press('End')
  await expect(cursor).toHaveCSS('left', '117px')

  // await page.waitForTimeout(4000)

  // await page.keyboard.type('>')
  // await expect(rowTwo).toHaveText('return <div></div>')
})
