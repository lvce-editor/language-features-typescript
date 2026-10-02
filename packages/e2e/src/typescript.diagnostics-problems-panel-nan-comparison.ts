import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics-problems-panel-nan-comparison'

export const test: Test = async ({ Command, expect, FileSystem, Locator, Main, Panel, Problems, Settings, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true })

  // act
  await Main.openUri(`${workspaceUrl}/src/nan-comparison.ts`)

  // assert
  await Panel.open('Problems')
  await Problems.show()
  const problems = Locator('.Problem:not([aria-level="3"])')
  try {
    await expect(problems).toHaveCount(2)
  } catch (error) {
    const uri = `${workspaceUrl}/src/nan-comparison.ts`
    const trace = await Command.executeExtensionCommand('typescript.debugFirstTrace', {
      uri,
      text: await FileSystem.readFile(uri),
    })
    throw new Error(`[DEBUG-pr-678] ${error}; first diagnostics: ${JSON.stringify(trace)}`)
  }
  const problemInfo = problems.nth(1)
  const label = problemInfo.locator('.ProblemLabel')
  await expect(label).toHaveText(`This condition will always return 'false'.`)
}
