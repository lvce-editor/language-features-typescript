import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics-multiple'

export const test: Test = async ({ Editor, FileSystem, Main, Settings, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true })

  // act
  await Main.openUri(`${workspaceUrl}/src/multiple.ts`)

  // assert
  const expectedDiagnostics = [
    {
      code: 2322,
      columnIndex: 12,
      endColumnIndex: 17,
      endRowIndex: 0,
      message: "Type 'string' is not assignable to type 'number'.",
      rowIndex: 0,
      source: 'ts',
      type: 'error',
      uri: `${workspaceUrl}/src/multiple.ts`,
    },
    {
      code: 2304,
      columnIndex: 20,
      endColumnIndex: 31,
      endRowIndex: 1,
      message: "Cannot find name 'missingName'.",
      rowIndex: 1,
      source: 'ts',
      type: 'error',
      uri: `${workspaceUrl}/src/multiple.ts`,
    },
  ] as const
  await Editor.shouldHaveDiagnostics(expectedDiagnostics)
}
