import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.completion-from-node-modules-relative'

export const test: Test = async ({ Editor, expect, FileSystem, Locator, Main }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(`${tmpDir}/package.json`, `{ "type": "module", "dependencies": { "lodash": "^1.0.0" } }`)
  await FileSystem.writeFile(`${tmpDir}/node_modules/lodash/package.json`, `{ "main": "index.js", "type": "module" }`)
  await FileSystem.writeFile(`${tmpDir}/node_modules/lodash/index.js`, `export const add = (a,b) => a + b`)
  await FileSystem.writeFile(`${tmpDir}/test.ts`, `import * as _ from './node_m'`)
  await Main.openUri(`${tmpDir}/test.ts`)
  await Editor.setCursor(0, 28)

  // act
  await Editor.openCompletion()

  // assert
  const completions = Locator('#Completions')
  await expect(completions).toBeVisible()
  const completionItems = completions.locator('.EditorCompletionItem')
  await expect(completionItems).toHaveCount(1)
  const firstCompletionItem = completionItems.nth(0)
  await expect(firstCompletionItem).toHaveText('node_modules')
}
