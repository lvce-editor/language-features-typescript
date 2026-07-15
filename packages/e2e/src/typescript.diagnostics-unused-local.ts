import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics-unused-local'

export const test: Test = async ({ Editor, FileSystem, Main, Settings, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics-unused')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true })

  // act
  await Main.openUri(`${workspaceUrl}/src/test.ts`)

  // assert
  const expectedDiagnostics = [
    {
      code: 6133,
      columnIndex: 5,
      endColumnIndex: 11,
      endRowIndex: 0,
      message: "'unused' is declared but its value is never read.",
      rowIndex: 0,
      source: 'ts',
      type: 'warning',
      uri: `${workspaceUrl}/src/test.ts`,
    },
  ] as const
  await Editor.shouldHaveDiagnostics(expectedDiagnostics)
}
