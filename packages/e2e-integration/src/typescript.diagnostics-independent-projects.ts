import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.diagnostics-independent-projects'

export const test: Test = async ({ Editor, expect, FileSystem, Locator, Main, Settings, Workspace }) => {
  const tmpDir = await FileSystem.getTmpDir()
  for (const project of ['a', 'b']) {
    await FileSystem.mkdir(`${tmpDir}/${project}`)
    await FileSystem.writeFile(`${tmpDir}/${project}/tsconfig.json`, JSON.stringify({ files: ['main.ts'] }))
  }
  const first = `${tmpDir}/a/main.ts`
  const second = `${tmpDir}/b/main.ts`
  await FileSystem.writeFile(first, "const value: number = ''\n")
  await FileSystem.writeFile(second, 'const value: string = 123\n')
  await Settings.update({ 'editor.diagnostics': true })
  await Workspace.setUri(tmpDir)
  for (const [uri, message] of [
    [first, "Type 'string' is not assignable to type 'number'."],
    [second, "Type 'number' is not assignable to type 'string'."],
  ]) {
    await Main.openUri(uri)
    await expect(Locator('.EditorContainer > .Viewlet.Editor')).toHaveCount(1)
    // Same global name in independent configs must not cause redeclaration errors.
    await expect(Locator('.ScrollBarDiagnosticError')).toHaveCount(1)
    await Editor.shouldHaveDiagnostics([
      {
        code: 2322,
        columnIndex: 6,
        endColumnIndex: 11,
        endRowIndex: 0,
        message,
        rowIndex: 0,
        source: 'ts',
        type: 'error',
        uri,
      },
    ])
  }
}
