import {
  runWithExtension,
  test,
  expect,
} from '@lvce-editor/test-with-playwright'
import { mkdtemp, writeFile } from 'fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'os'
import { TIMEOUT_LONG } from './_timeout.js'

const getTmpDir = () => {
  return mkdtemp(join(tmpdir(), 'typescript-references'))
}

test('typescript.semantic-highlighting', async () => {
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

  const rowTwo = page.locator('.EditorRow').nth(2)
  const tokenAdd = rowTwo.locator('.Token', { hasText: 'add' })
  await expect(tokenAdd).toHaveClass('Token Function', {
    timeout: TIMEOUT_LONG,
  })
})
