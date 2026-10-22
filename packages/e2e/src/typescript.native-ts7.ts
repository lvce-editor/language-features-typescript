import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.native-ts7'

// Enable after the server dependency contains extension-management-worker#366 and
// the application-owned TS7 executable from lvce-editor#16222.
export const skip = 1

export const test: Test = async ({ Command, Editor, expect, FileSystem, Locator, Main, Settings, Workspace }) => {
  const root = await FileSystem.getTmpDir({ scheme: 'file' })
  await FileSystem.writeFile(
    `${root}/tsconfig.json`,
    JSON.stringify({ compilerOptions: { strict: true }, files: ['main.ts'] }),
  )
  const uri = `${root}/main.ts`
  await FileSystem.writeFile(uri, 'const value: string = 123;\n')
  await Settings.update({ 'editor.diagnostics': true, 'typescript.useTs7': true })
  await Workspace.setUri(root)
  await Main.openUri(uri)
  await Command.execute('Editor.waitForDiagnostics')
  await Editor.shouldHaveDiagnostics([
    {
      message: "Type 'number' is not assignable to type 'string'.",
      code: 2322,
      columnIndex: 6,
      endColumnIndex: 11,
      endRowIndex: 0,
      rowIndex: 0,
      source: 'ts',
      type: 'error',
      uri,
    },
  ])
  await Editor.setText('const greeting = "hello";\ngreeting.')
  await Editor.setCursor(1, 9)
  await Editor.openCompletion()
  const items = Locator('#Completions .EditorCompletionItem')
  await expect(items).toContainText('toUpperCase')
}
