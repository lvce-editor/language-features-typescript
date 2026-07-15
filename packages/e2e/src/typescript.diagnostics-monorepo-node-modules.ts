import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics-monorepo-node-modules'

export const test: Test = async ({ Editor, FileSystem, Main, Settings, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics-monorepo-node-modules')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true })

  // act
  const uri = `${workspaceUrl}/packages/build/src/build.ts`
  await Main.openUri(uri)

  // assert
  const expectedDiagnostics = [
    {
      code: 2322,
      columnIndex: 3,
      endColumnIndex: 4,
      endRowIndex: 1,
      message: "Type 'number' is not assignable to type 'string'.",
      rowIndex: 1,
      source: 'ts',
      type: 'error',
      uri,
    },
  ] as const
  await Editor.shouldHaveDiagnostics(expectedDiagnostics)
}
