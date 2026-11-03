import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.completion-from-node-modules-monorepo'

export const test: Test = async ({ Editor, expect, FileSystem, Locator, Main, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/completion-from-node-modules-monorepo')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/packages/app/src/test.ts`)
  await Editor.setCursor(0, 20)

  // act
  await Editor.openCompletion()

  // assert
  const completions = Locator('#Completions')
  await expect(completions).toBeVisible()
  const completionItems = completions.locator('.EditorCompletionItem')
  const firstCompletionItem = completionItems.nth(0)
  try {
    await expect(firstCompletionItem).toHaveText('lodash')
  } catch (error) {
    const paths = ['package.json', 'packages/app/tsconfig.json', 'node_modules/lodash/package.json']
    const files = await Promise.all(
      paths.map(async (path) => [path, await FileSystem.readFile(`${workspaceUrl}/${path}`)]),
    )
    const directories = await Promise.all(
      ['', '/packages/app/src', '/node_modules'].map(async (path) => [
        path,
        await FileSystem.readDir(workspaceUrl + path),
      ]),
    )
    throw new Error(`${error}\nFixture inputs: ${JSON.stringify({ files, directories })}`, { cause: error })
  }
}
