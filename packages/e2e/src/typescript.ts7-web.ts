import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.ts7-web'

export const test: Test = async ({
  Command,
  Editor,
  expect,
  FileSystem,
  KeyBoard,
  Locator,
  Main,
  Settings,
  Workspace,
}) => {
  const shouldHaveActiveDiagnostics = async (expected: readonly Record<string, unknown>[]) => {
    // The legacy helper selects the newest editor, which can be an inactive
    // imported file after switching back to an existing tab.
    const actual = (await Command.execute('GetActiveEditor.getDiagnostics')) as Record<string, unknown>[]
    if (
      actual.length !== expected.length ||
      expected.some((item, index) => Object.entries(item).some(([key, value]) => actual[index]?.[key] !== value))
    ) {
      throw new Error(`Unexpected active diagnostics: ${JSON.stringify(actual)}; expected ${JSON.stringify(expected)}`)
    }
  }
  const fixtureUrl = import.meta.resolve('../fixtures/ts7-web')
  const workspaceUrl = await FileSystem.loadFixture(fixtureUrl)
  await Workspace.setUri(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true, 'typescript.useTs7': false })
  const mainUri = `${workspaceUrl}/main.ts`
  await Main.openUri(mainUri)
  await Command.execute('Editor.waitForDiagnostics')
  await shouldHaveActiveDiagnostics([])

  await Editor.setCursor(4, 6)
  await Editor.openCompletion()
  const completions = Locator('#Completions')
  const diagnostics = Locator('.Diagnostic')
  await expect(completions).toContainText('title')
  await KeyBoard.press('Escape')

  await Editor.setText('import { dependency } from "example";\ndependency.packageValue\n')
  await Editor.setCursor(1, 11)
  await Editor.openCompletion()
  await expect(completions).toContainText('packageValue')
  await KeyBoard.press('Escape')

  // Editing an imported file without saving must change the importing file's types.
  await Main.openUri(`${workspaceUrl}/model.ts`)
  await Editor.setText('export const model = { title: 123, fresh: true };\n')
  await Command.execute('Editor.waitForDiagnostics')
  await Main.openUri(mainUri)
  await Editor.setText('import { model } from "./model.js";\nconst value: string = model.title;\nmodel.fresh\n')
  await Command.execute('Editor.waitForDiagnostics')
  await expect(diagnostics).toHaveCount(1)
  const expectedDiagnostics = [
    {
      code: 2322,
      columnIndex: 6,
      endColumnIndex: 11,
      endRowIndex: 1,
      message: "Type 'number' is not assignable to type 'string'.",
      rowIndex: 1,
      source: 'ts',
      type: 'error',
      uri: mainUri,
    },
  ] as const
  await shouldHaveActiveDiagnostics(expectedDiagnostics)
  await Editor.setCursor(2, 6)
  await Editor.openCompletion()
  await expect(completions).toContainText('fresh')
  await KeyBoard.press('Escape')

  await Editor.setText('const corrected: number = 123;\n')
  await Command.execute('Editor.waitForDiagnostics')
  await shouldHaveActiveDiagnostics([])
  await Editor.setText('const broken = ;\n')
  await Command.execute('Editor.waitForDiagnostics')
  await expect(diagnostics).toHaveCount(1)
  console.warn(
    'TS7_METRICS ' + JSON.stringify(await Command.executeExtensionCommand('typescript.getProjectCacheStatistics')),
  )
}
