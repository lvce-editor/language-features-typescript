import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics-hoisted-node-module-value-import'

export const test: Test = async ({ Editor, FileSystem, Main, Settings, Workspace }) => {
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics-hoisted-node-modules')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true })

  const uri = `${workspaceUrl}/packages/running-extensions-view/src/value-import.ts`
  await Main.openUri(uri)

  const expectedDiagnostics = [
    {
      code: 2345,
      columnIndex: 70,
      endColumnIndex: 72,
      endRowIndex: 2,
      message: "Argument of type 'number' is not assignable to parameter of type 'string'.",
      rowIndex: 2,
      source: 'ts',
      type: 'error',
      uri,
    },
  ] as const
  await Editor.shouldHaveDiagnostics(expectedDiagnostics)
}
