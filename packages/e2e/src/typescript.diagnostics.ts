import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics'

export const skip = 1

export const test: Test = async ({ Workspace, Main, Panel, Problems, Locator, expect }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics').toString()
  const workspaceUrl = Workspace.resolveFileUrl(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Main.openUri(`${workspaceUrl}/src/test.ts`)

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
