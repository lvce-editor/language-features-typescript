import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics-problems-panel-const-assignment'

export const test: Test = async ({ expect, FileSystem, Locator, Main, Panel, Problems, Settings, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true })

  // act
  await Main.openUri(`${workspaceUrl}/src/const-assignment.ts`)

  // assert
  await Panel.open('Problems')
  await Problems.show()
  const problems = Locator('.Problem')
  await expect(problems).toHaveCount(2)
  const problemInfo = problems.nth(1)
  const label = problemInfo.locator('.Label')
  await expect(label).toHaveText(`Cannot assign to 'answer' because it is a constant.`)
}
