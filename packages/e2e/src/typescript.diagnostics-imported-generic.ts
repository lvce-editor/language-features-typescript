import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics-imported-generic'

export const test: Test = async ({ Editor, FileSystem, Main, Settings, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics-varied')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true })

  // act
  const uri = `${workspaceUrl}/src/imported-generic/consumer.ts`
  await Main.openUri(uri)

  // assert
  const expectedDiagnostics = [
    {
      code: 2344,
      columnIndex: 27,
      endColumnIndex: 33,
      endRowIndex: 1,
      message: "Type 'string' does not satisfy the constraint 'number'.",
      rowIndex: 1,
      source: 'ts',
      type: 'error',
      uri,
    },
  ] as const
  await Editor.shouldHaveDiagnostics(expectedDiagnostics)
}
