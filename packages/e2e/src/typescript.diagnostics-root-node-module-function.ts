import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics-root-node-module-function'

export const test: Test = async ({ Editor, FileSystem, Main, Settings, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics-root-node-modules')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true })

  // act
  const uri = `${workspaceUrl}/src/function-argument.ts`
  await Main.openUri(uri)

  // assert
  const expectedDiagnostics = [
    {
      code: 2345,
      columnIndex: 29,
      endColumnIndex: 34,
      endRowIndex: 2,
      message: "Argument of type 'string' is not assignable to parameter of type 'number'.",
      rowIndex: 2,
      source: 'ts',
      type: 'error',
      uri,
    },
  ] as const
  await Editor.shouldHaveDiagnostics(expectedDiagnostics)
}
