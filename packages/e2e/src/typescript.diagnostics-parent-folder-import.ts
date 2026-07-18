import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics-parent-folder-import'

export const test: Test = async ({ Editor, FileSystem, Main, Settings, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics-varied')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true })

  // act
  const uri = `${workspaceUrl}/src/features/orders/consumer.ts`
  await Main.openUri(uri)

  // assert
  const expectedDiagnostics = [
    {
      code: 2345,
      columnIndex: 35,
      endColumnIndex: 44,
      endRowIndex: 1,
      message: `Argument of type '"pending"' is not assignable to parameter of type '"open" | "closed"'.`,
      rowIndex: 1,
      source: 'ts',
      type: 'error',
      uri,
    },
  ] as const
  await Editor.shouldHaveDiagnostics(expectedDiagnostics)
}
