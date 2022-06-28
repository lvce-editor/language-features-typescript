import {
  expect,
  getTmpDir,
  runWithExtension,
  test,
} from '@lvce-editor/test-with-playwright'
import { writeFile } from 'fs/promises'

test.skip('typescript.jsx-closing-tag', async () => {
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

  const tokenButton = page.locator('.Token', { hasText: 'button' })
  await expect(tokenButton).toHaveClass('Token Function')

  await page.keyboard.type('>')
  // await expect(rowTwo).toHaveText('return <div></div>')
})
