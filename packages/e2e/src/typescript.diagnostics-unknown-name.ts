import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics-unknown-name'

export const test: Test = async ({ Editor, FileSystem, Main, Settings, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true })

  // act
  await Main.openUri(`${workspaceUrl}/src/unknown-name.ts`)

  // assert
  const expectedDiagnostics = [
    {
      code: 2304,
      columnIndex: 20,
      endColumnIndex: 31,
      endRowIndex: 0,
      message: "Cannot find name 'missingName'.",
      rowIndex: 0,
      source: 'ts',
      type: 'error',
      uri: `${workspaceUrl}/src/unknown-name.ts`,
    },
  ] as const
  await Editor.shouldHaveDiagnostics(expectedDiagnostics)
}
