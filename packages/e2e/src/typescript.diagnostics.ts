import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics'

export const test: Test = async ({ Editor, expect, FileSystem, Locator, Main, Settings, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true })

  // act
  await Main.openUri(`${workspaceUrl}/src/test.ts`)

  // assert
  const expectedDiagnostics = [
    {
      code: 2322,
      columnIndex: 0,
      endColumnIndex: 1,
      endRowIndex: 2,
      message: "Type 'string' is not assignable to type 'number'.",
      rowIndex: 2,
      source: 'ts',
      type: 'error',
      uri: `${workspaceUrl}/src/test.ts`,
    },
  ] as const
  await Editor.shouldHaveDiagnostics(expectedDiagnostics)
  const diagnostic = Locator('.Diagnostic.DiagnosticError')
  await expect(diagnostic).toHaveCSS('height', '20px')
  await expect(diagnostic).toHaveCSS('top', '20px')
  await expect(diagnostic).toHaveCSS('width', '9.5px')
}
