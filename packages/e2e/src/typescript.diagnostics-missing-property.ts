import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics-missing-property'

export const test: Test = async ({ Editor, FileSystem, Main, Settings, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true })

  // act
  await Main.openUri(`${workspaceUrl}/src/missing-property.ts`)

  // assert
  const expectedDiagnostics = [
    {
      code: 2741,
      columnIndex: 13,
      endColumnIndex: 17,
      endRowIndex: 6,
      message: "Property 'age' is missing in type '{ name: string; }' but required in type 'User'.",
      rowIndex: 6,
      source: 'ts',
      type: 'error',
      uri: `${workspaceUrl}/src/missing-property.ts`,
    },
  ] as const
  await Editor.shouldHaveDiagnostics(expectedDiagnostics)
}
