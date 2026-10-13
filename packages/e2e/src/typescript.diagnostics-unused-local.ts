import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics-unused-local'

export const test: Test = async ({ Command, Editor, expect, FileSystem, Locator, Main, Settings, Workspace }) => {
  // arrange
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics-unused')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setUri(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true })

  // act
  await Main.openUri(`${workspaceUrl}/src/test.ts`)
  await Command.execute('Editor.waitForDiagnostics')

  // assert
  const diagnostics = Locator('.Diagnostic')
  const unnecessaryTokens = Locator('.EditorTokenUnnecessary')
  const expectedDiagnostics = [
    {
      code: 6133,
      columnIndex: 6,
      endColumnIndex: 12,
      endRowIndex: 1,
      message: "'unused' is declared but its value is never read.",
      rowIndex: 1,
      source: 'ts',
      tags: [1],
      type: 'warning',
      uri: `${workspaceUrl}/src/test.ts`,
    },
  ] as const
  await expect(diagnostics).toHaveCount(expectedDiagnostics.length)
  await Editor.shouldHaveDiagnostics(expectedDiagnostics)
  await expect(unnecessaryTokens).toHaveText('unused')

  // Make the variable used and verify the unnecessary styling is removed without reopening the file.
  await Editor.setText('export const fixture = true\nconst unused = 1\nvoid unused\n\nexport {}')
  await Command.execute('Editor.waitForDiagnostics')
  await Editor.shouldHaveDiagnostics([])
  await expect(unnecessaryTokens).toHaveCount(0)

  // Restore the unused declaration and verify the styling returns.
  await Editor.setText('export const fixture = true\nconst unused = 1\n\nexport {}')
  await Command.execute('Editor.waitForDiagnostics')
  await Editor.shouldHaveDiagnostics(expectedDiagnostics)
  await expect(unnecessaryTokens).toHaveText('unused')
}
