import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics'

export const test: Test = async ({ Editor, FileSystem, Workspace, Main }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics').toString()
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)

  // act
  await Main.openUri(`${workspaceUrl}/src/test.ts`)

  // assert
  await Editor.shouldHaveDiagnostics([
    {
      rowIndex: 1,
      columnIndex: -1,
      endRowIndex: 1,
      endColumnIndex: 0,
      message: "Type 'string' is not assignable to type 'number'.",
      type: 'error',
    },
  ])
}
