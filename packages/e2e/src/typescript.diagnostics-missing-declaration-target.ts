import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics-missing-declaration-target'

export const test: Test = async ({ Editor, FileSystem, Main, Settings, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics-missing-declaration-target')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true })

  // act
  await Main.openUri(`${workspaceUrl}/src/main.ts`)

  // assert
  const uri = `${workspaceUrl}/src/main.ts`
  const expectedDiagnostics = [
    {
      code: 2322,
      columnIndex: 13,
      endColumnIndex: 17,
      endRowIndex: 2,
      message: "Type 'number' is not assignable to type 'string'.",
      rowIndex: 2,
      source: 'ts',
      type: 'error',
      uri,
    },
  ] as const
  await Editor.shouldHaveDiagnostics(expectedDiagnostics)
}
