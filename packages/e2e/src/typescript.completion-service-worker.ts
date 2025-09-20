import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.completion-service-worker'

export const test: Test = async ({ FileSystem, Main, Editor, Locator, expect }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(
    `${tmpDir}/tsconfig.json`,
    JSON.stringify(
      {
        compilerOptions: {
          lib: ['esnext', 'webworker'],
          types: [],
        },
      },
      null,
      2,
    ),
  )
  await FileSystem.writeFile(`${tmpDir}/test.ts`, 'WorkerG')
  await Main.openUri(`${tmpDir}/test.ts`)
  await Editor.setCursor(0, 7)

  // act
  await Editor.openCompletion()

  // assert
  const completions = Locator('#Completions')
  await expect(completions).toBeVisible()
  const completionItems = completions.locator('.EditorCompletionItem')
  await expect(completionItems.nth(0)).toHaveText('DedicatedWorkerGlobalScope')
}
