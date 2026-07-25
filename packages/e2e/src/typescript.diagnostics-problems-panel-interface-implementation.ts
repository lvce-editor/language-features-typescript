import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics-problems-panel-interface-implementation'

export const test: Test = async ({ expect, FileSystem, Locator, Main, Panel, Problems, Settings, Workspace }) => {
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true })

  await Main.openUri(`${workspaceUrl}/src/interface-implementation.ts`)

  await Panel.open('Problems')
  await Problems.show()
  const problems = Locator('.Problem')
  await expect(problems).toHaveCount(2)
  const label = problems.nth(1).locator('.Label')
  await expect(label).toHaveText(
    `Property 'name' in type 'User' is not assignable to the same property in base type 'Named'.\n  Type 'number' is not assignable to type 'string'.`,
  )
}
