import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics-problems-panel-variable-before-declaration'

export const test: Test = async ({ expect, FileSystem, Locator, Main, Panel, Problems, Settings, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true })

  // act
  await Main.openUri(`${workspaceUrl}/src/variable-before-declaration.ts`)

  // assert
  await Panel.open('Problems')
  await Problems.show()
  const problems = Locator('.Problem')
  await expect(problems).toHaveCount(3)
  const declarationProblem = problems.nth(1)
  const declarationLabel = declarationProblem.locator('.Label')
  await expect(declarationLabel).toHaveText(`Block-scoped variable 'later' used before its declaration.`)
  const assignmentProblem = problems.nth(2)
  const assignmentLabel = assignmentProblem.locator('.Label')
  await expect(assignmentLabel).toHaveText(`Variable 'later' is used before being assigned.`)
}
