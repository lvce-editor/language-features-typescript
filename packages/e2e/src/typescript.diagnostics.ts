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

  const problems = Locator('.Problem')
  await expect(problems).toHaveCount(2)

  const problemInfo = problems.nth(1)
  const label = problemInfo.locator('.Label')
  await expect(label).toHaveText(`Type 'string' is not assignable to type 'number'.`)

  // act
  // TODO
  // 1. run diagnostics
  // 2. validate diagnostics are as expected
}
