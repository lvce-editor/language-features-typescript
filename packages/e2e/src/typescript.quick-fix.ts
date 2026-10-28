import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.quick-fix'

export const test: Test = async ({ Command, Editor, expect, FileSystem, Locator, Main, Settings, Workspace }) => {
  // arrange
  const workspaceUrl = await FileSystem.getTmpDir({ scheme: 'file' })
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
  await expect(Locator('.Diagnostic')).toHaveCount(expectedDiagnostics.length)
  await Editor.shouldHaveDiagnostics(expectedDiagnostics)
  await Editor.setCursor(6, 4)

  // act
  await Editor.openSourceActions()

  // assert
  const action = Locator('.SourceActionItem', { hasText: 'Add missing properties' })
  await expect(action).toBeVisible()
  await expect(Locator('.SourceActionItem', { hasText: 'Organize Imports' })).toBeVisible()
  await expect(Locator('.SourceActionItem', { hasText: 'Add All Missing Imports' })).toBeVisible()
  await Command.execute('EditorSourceAction.selectItem', 'Add missing properties')

  // assert
  await expect(Locator('.SourceActionItem')).toBeHidden()
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
  await Editor.shouldHaveDiagnostics([])
}
