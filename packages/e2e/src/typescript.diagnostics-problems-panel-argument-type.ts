import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics-problems-panel-argument-type'

export const test: Test = async ({ expect, FileSystem, Locator, Main, Panel, Problems, Settings, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true })

  // act
  await Main.openUri(`${workspaceUrl}/src/argument-type.ts`)

  // assert
  await Panel.open('Problems')
  await Problems.show()
  const problems = Locator('.Problem')
  await expect(problems).toHaveCount(2)
  const problemInfo = problems.nth(1)
  const label = problemInfo.locator('.Label')
  await expect(label).toHaveText(`Argument of type 'string' is not assignable to parameter of type 'number'.`)
}
