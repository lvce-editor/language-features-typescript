import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics-nested-missing-property'

export const test: Test = async ({ Editor, FileSystem, Main, Settings, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics-varied')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true })

  // act
  const uri = `${workspaceUrl}/src/nested/domain/user/missing-property.ts`
  await Main.openUri(uri)

  // assert
  const expectedDiagnostics = [
    {
      code: 2741,
      columnIndex: 13,
      endColumnIndex: 17,
      endRowIndex: 5,
      message: "Property 'age' is missing in type '{ name: string; }' but required in type 'User'.",
      rowIndex: 5,
      source: 'ts',
      type: 'error',
      uri,
    },
  ] as const
  await Editor.shouldHaveDiagnostics(expectedDiagnostics)
}
