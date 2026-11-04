import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.symbols'

export const test: Test = async ({ Command, Editor, expect, FileSystem, Locator, Main, Settings, Workspace }) => {
  const root = await FileSystem.getTmpDir({ scheme: 'memfs' })
  const uri = `${root}/symbols.ts`
  const text =
    'export class Widget { value = 1; method(input: string): number { return input.length; } }\nconst widget = new Widget();\nwidget.method("hello");\n'
  await FileSystem.mkdir(root)
  await FileSystem.writeFile(uri, text)
  await Workspace.setUri(root)
  await Settings.update({ 'breadcrumbs.enabled': true })
  await Main.openUri(uri)
  await Editor.setCursor(0, text.indexOf('return input') + 2)
  const symbols = Locator('.EditorBreadcrumbSymbol')
  await expect(symbols).toHaveCount(2)
  const classSymbol = symbols.nth(0)
  const methodSymbol = symbols.nth(1)
  await expect(classSymbol).toHaveText('Widget')
  await expect(methodSymbol).toHaveText('method')

  // Symbols must refresh after an unsaved edit.
  await Editor.setText(text.replaceAll('method', 'updated'))
  await Editor.setCursor(0, text.indexOf('return input') + 3)
  await expect(methodSymbol).toHaveText('updated')
  await Editor.setCursor(2, 16)
  await Command.execute('Editor.showSignatureHelp')
  const signatureHelp = Locator('.EditorHover')
  await expect(signatureHelp).toContainText('widget.updated(input: string): number')
}
