import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics-rapid-edits'

export const test: Test = async ({ Command, Editor, FileSystem, Main, Settings, Workspace }) => {
  const root = await FileSystem.getTmpDir({ scheme: 'memfs' })
  try {
    const uri = `${root}/main.ts`
    await FileSystem.writeFile(
      `${root}/tsconfig.json`,
      JSON.stringify({ compilerOptions: { types: [] }, files: ['main.ts'] }),
    )
    await FileSystem.writeFile(uri, 'const value: number = 1;')
    await Workspace.setUri(root)
    await Settings.update({ 'editor.diagnostics': true })
    await Main.openUri(uri)
    await Command.execute('Editor.waitForDiagnostics')
    await Editor.shouldHaveDiagnostics([])
    await Command.execute('Editor.selectAll')
    await Command.execute('Editor.type', 'const value: number = "')
    for (const character of 'abcdefghij') await Command.execute('Editor.type', character)
    await Command.execute('Editor.type', '";')
    await Command.execute('Editor.waitForDiagnostics')
    await Editor.shouldHaveText('const value: number = "abcdefghij";')
    const expectedDiagnostics = [
      {
        code: 2322,
        columnIndex: 6,
        endColumnIndex: 11,
        endRowIndex: 0,
        message: "Type 'string' is not assignable to type 'number'.",
        rowIndex: 0,
        source: 'ts',
        type: 'error',
        uri,
      },
    ] as const
    await Editor.shouldHaveDiagnostics(expectedDiagnostics)
    await Command.execute('Editor.selectAll')
    await Command.execute('Editor.type', 'const value: number = 42;')
    await Command.execute('Editor.waitForDiagnostics')
    await Editor.shouldHaveDiagnostics([])
  } finally {
    await FileSystem.remove(root)
  }
}
