import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics'

export const test: Test = async ({ FileSystem, Main, Panel, Problems, Locator, expect }) => {
  // arrange
  const tmpDir = await FileSystem.getTmpDir()
  await FileSystem.writeFile(
    `${tmpDir}/test.ts`,
    `let x = 1

x = 'a'`,
  )
  await Main.openUri(`${tmpDir}/test.ts`)

  await Panel.open('Problems')
  await Problems.show()

  const problemsView = Locator('.Viewlet.Problems')
  await expect(problemsView).toHaveText(
    `Error: Failed to execute diagnostic provider: TypeError: Cannot read properties of undefined (reading 'line')`,
  )

  // act
  // TODO
  // 1. run diagnostics
  // 2. validate diagnostics are as expected
}
