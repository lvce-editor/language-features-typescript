import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics-problems-panel'

export const test: Test = async ({ FileSystem, Workspace, Main, Panel, Problems, Locator, expect }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics').toString()
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)

  // act
  await Main.openUri(`${workspaceUrl}/src/test.ts`)

  // assert
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
