import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics-hoisted-node-module-type-import'

export const test: Test = async ({ Editor, FileSystem, Main, Settings, Workspace }) => {
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics-hoisted-node-modules')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true })

  const uri = `${workspaceUrl}/packages/running-extensions-view/src/type-import.ts`
  await Main.openUri(uri)

  const expectedDiagnostics = [
    {
      code: 2741,
      columnIndex: 13,
      endColumnIndex: 18,
      endRowIndex: 2,
      message: "Property 'extensions' is missing in type '{}' but required in type 'RunningExtensionsState'.",
      rowIndex: 2,
      source: 'ts',
      type: 'error',
      uri,
    },
  ] as const
  await Editor.shouldHaveDiagnostics(expectedDiagnostics)
}
