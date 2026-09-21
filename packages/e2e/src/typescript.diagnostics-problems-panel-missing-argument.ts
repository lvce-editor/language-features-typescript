import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics-problems-panel-missing-argument'

export const test: Test = async ({ expect, FileSystem, Locator, Main, Panel, Problems, Settings, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true })

  // act
  await Main.openUri(`${workspaceUrl}/src/missing-argument.ts`)

  // assert
  await Panel.open('Problems')
  await Problems.show()
  const problems = Locator('.Problem:not([aria-level="3"])')
  await expect(problems).toHaveCount(2)
  const problemInfo = problems.nth(1)
  const label = problemInfo.locator('.ProblemLabel')
  await expect(label).toHaveText('Expected 2 arguments, but got 1.')
  const relatedInformation = Locator('.Problem[aria-level="3"] .ProblemLabel')
  await expect(relatedInformation).toHaveCount(1)
  await expect(relatedInformation).toHaveText("An argument for 'right' was not provided.")
}
