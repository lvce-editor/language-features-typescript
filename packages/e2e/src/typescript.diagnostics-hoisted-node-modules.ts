import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics-hoisted-node-modules'

export const test: Test = async ({ Editor, FileSystem, Main, Settings, Workspace }) => {
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics-hoisted-node-modules')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true })

  const uri = `${workspaceUrl}/packages/running-extensions-view/src/diagnostics.ts`
  await Main.openUri(uri)

  const expectedDiagnostics = [
    {
      code: 2322,
      columnIndex: 4,
      endColumnIndex: 5,
      endRowIndex: 4,
      message: "Type 'number' is not assignable to type 'string'.",
      rowIndex: 4,
      source: 'ts',
      type: 'error',
      uri,
    },
  ] as const
  await Editor.shouldHaveDiagnostics(expectedDiagnostics)
}
