import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics-barrel-import'

export const test: Test = async ({ Editor, FileSystem, Main, Settings, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics-varied')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true })

  // act
  const uri = `${workspaceUrl}/src/barrel/consumer.ts`
  await Main.openUri(uri)

  // assert
  const expectedDiagnostics = [
    {
      code: 2540,
      columnIndex: 8,
      endColumnIndex: 13,
      endRowIndex: 2,
      message: "Cannot assign to 'theme' because it is a read-only property.",
      rowIndex: 2,
      source: 'ts',
      type: 'error',
      uri,
    },
  ] as const
  await Editor.shouldHaveDiagnostics(expectedDiagnostics)
}
