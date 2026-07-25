import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics-problems-panel-not-callable'

export const test: Test = async ({ expect, FileSystem, Locator, Main, Panel, Problems, Settings, Workspace }) => {
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true })

  await Main.openUri(`${workspaceUrl}/src/not-callable.ts`)

  await Panel.open('Problems')
  await Problems.show()
  const problems = Locator('.Problem')
  await expect(problems).toHaveCount(2)
  const label = problems.nth(1).locator('.Label')
  await expect(label).toHaveText(`This expression is not callable.\n  Type '{}' has no call signatures.`)
}
