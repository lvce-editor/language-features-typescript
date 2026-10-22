import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.native-ts7'

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
  const expectedDiagnostics = [
    {
      code: 2322,
      columnIndex: 6,
      endColumnIndex: 11,
      endRowIndex: 0,
      message: "Type 'number' is not assignable to type 'string'.",
      rowIndex: 0,
      source: 'ts',
      type: 'error',
      uri,
    },
  ] as const
  await Editor.shouldHaveDiagnostics(expectedDiagnostics)
  let workerCommandError = ''
  try {
    await Command.executeExtensionCommand('typescript.getProjectCacheStatistics')
  } catch (error) {
    workerCommandError = String(error)
  }
  if (!workerCommandError.includes('command typescript.getProjectCacheStatistics not found')) {
    throw new Error(
      `Native mode must dispose worker-only commands: ${workerCommandError || 'worker command succeeded'}`,
    )
  }
  await Editor.setText('const value: string = "valid";\n')
  await Command.execute('Editor.waitForDiagnostics')
  await Editor.shouldHaveDiagnostics([])
  await Editor.setText('const greeting = "hello";\ngreeting.toU')
  await Editor.setCursor(1, 12)
  await Editor.openCompletion()
  const items = Locator('#Completions')
  await expect(items).toContainText('toUpperCase')
}
