import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics-problems-panel-message-chain'

export const test: Test = async ({ Command, Editor, expect, FileSystem, Locator, Main, Panel, Problems, Settings, Workspace }) => {
  const fixtureUrl = import.meta.resolve('../fixtures/diagnostics-message-chain')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setPath(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true })

  const uri = `${workspaceUrl}/src/index.ts`
  await Main.openUri(uri)
  const message =
    "Element implicitly has an 'any' type because expression of type 'number' can't be used to index type '{ extensions: never[]; }'.\n  No index signature with a parameter of type 'number' was found on type '{ extensions: never[]; }'."
  const editorId = await Command.execute('GetActiveEditor.getActiveEditorId')
  await Editor.shouldHaveDiagnosticProviderResult(
    [
      {
        code: 7053,
        columnIndex: 25,
        endColumnIndex: 37,
        endRowIndex: 5,
        message,
        rowIndex: 5,
        source: 'ts',
        type: 'error',
        uri,
      },
    ],
    editorId,
  )

  await Panel.open('Problems')
  await Problems.show()
  const problems = Locator('.Problem:not([aria-level="3"])')
  await expect(problems).toHaveCount(2)
  const label = problems.nth(1).locator('.ProblemLabel')
  await expect(label).toHaveText(message)
}
