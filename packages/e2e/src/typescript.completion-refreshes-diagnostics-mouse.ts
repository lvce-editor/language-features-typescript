import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.completion-refreshes-diagnostics-mouse'

// cspell:ignore BoxGeome

export const test: Test = async ({
  Command,
  Editor,
  expect,
  FileSystem,
  KeyBoard,
  Locator,
  Main,
  Panel,
  Problems,
  Settings,
  Workspace,
}) => {
  const workspaceUrl = `${await FileSystem.getTmpDir()}/completion-refreshes-diagnostics-mouse`
  await FileSystem.mkdir(workspaceUrl)
  await FileSystem.writeFile(
    `${workspaceUrl}/mouse.ts`,
    'const shape = {\n  BoxGeometry: 1,\n}\n\nexport const geometry: number = shape.BoxGeome\nexport const unrelated: string = 1\n',
  )
  await Workspace.setUri(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true })
  await Main.openUri(`${workspaceUrl}/mouse.ts`)
  await Command.execute('Editor.waitForDiagnostics')
  const diagnostics = Locator('.Diagnostic')
  await expect(diagnostics).toHaveCount(2)
  await Editor.setCursor(4, 46)

  await Editor.openCompletion()
  const completions = Locator('#Completions')
  await expect(completions).toBeVisible()
  const completionItem = completions.locator('.EditorCompletionItem').first()
  await expect(completionItem).toHaveText('BoxGeometry')
  // eslint-disable-next-line e2e/no-direct-click, @typescript-eslint/no-deprecated -- this scenario verifies pointer selection.
  await completionItem.click()
  await KeyBoard.press('Enter')

  await Editor.shouldHaveText(
    'const shape = {\n  BoxGeometry: 1,\n}\n\nexport const geometry: number = shape.BoxGeometry\nexport const unrelated: string = 1\n',
  )
  await expect(diagnostics).toHaveCount(1)
  const uri = `${workspaceUrl}/mouse.ts`
  const expectedDiagnostics = [
    {
      code: 2322,
      columnIndex: 13,
      endColumnIndex: 22,
      endRowIndex: 5,
      message: "Type 'number' is not assignable to type 'string'.",
      rowIndex: 5,
      source: 'ts',
      type: 'error',
      uri,
    },
  ] as const
  await Editor.shouldHaveDiagnostics(expectedDiagnostics)

  await Panel.open('Problems')
  await Problems.show()
  const problems = Locator('.Problem:not([aria-level="3"])')
  await expect(problems).toHaveCount(2)
  const unrelatedProblem = problems.nth(1).locator('.ProblemLabel')
  await expect(unrelatedProblem).toHaveText("Type 'number' is not assignable to type 'string'.")

  await Editor.setCursor(4, 46)
  await Editor.openHover()
  const hover = Locator('.EditorHover')
  await expect(hover).toBeVisible()
  await expect(hover).toContainText('(property) BoxGeometry: number')
}
