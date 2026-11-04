import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.quick-fix-web'

export const test: Test = async ({ Command, Editor, expect, FileSystem, Locator, Main, Settings, Workspace }) => {
  // arrange
  const workspaceUrl = await FileSystem.getTmpDir({ scheme: 'memfs' })
  await FileSystem.mkdir(`${workspaceUrl}/src`)
  const uri = `${workspaceUrl}/src/test.ts`
  await FileSystem.writeFile(
    uri,
    `interface DragDataItem {
  data: string
  type: string
}

const items: DragDataItem[] = [
  {},
]
`,
  )
  await Workspace.setUri(workspaceUrl)
  await Settings.update({ 'editor.diagnostics': true })
  await Main.openUri(uri)
  await Command.execute('Editor.waitForDiagnostics')
  const expectedDiagnostics = [
    {
      code: 2739,
      columnIndex: 2,
      endColumnIndex: 4,
      endRowIndex: 6,
      message: "Type '{}' is missing the following properties from type 'DragDataItem': data, type",
      rowIndex: 6,
      source: 'ts',
      type: 'error',
      uri,
    },
  ] as const
  const diagnostics = Locator('.Diagnostic')
  await expect(diagnostics).toHaveCount(expectedDiagnostics.length)
  await Editor.shouldHaveDiagnostics(expectedDiagnostics)
  await Editor.setCursor(6, 4)

  // act
  await Editor.openSourceActions()

  // assert
  const action = Locator('.SourceActionItem', { hasText: 'Add missing properties' })
  await expect(action).toBeVisible()
  const organizeImports = Locator('.SourceActionItem', { hasText: 'Organize Imports' })
  await expect(organizeImports).toBeVisible()
  const addImports = Locator('.SourceActionItem', { hasText: 'Add All Missing Imports' })
  await expect(addImports).toBeVisible()
  await Command.execute('EditorSourceAction.selectItem', 'Add missing properties')

  // assert
  const actions = Locator('.SourceActionItem')
  await expect(actions).toBeHidden()
  await Editor.shouldHaveText(`interface DragDataItem {
  data: string
  type: string
}

const items: DragDataItem[] = [
  {
data: "",
type: ""
},
]
`)
  await Command.execute('Editor.waitForDiagnostics')
  await Editor.shouldHaveDiagnostics([])
}
