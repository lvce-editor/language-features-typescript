import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'typescript.symbols'

export const test: Test = async ({ Command, Editor, expect, FileSystem, Locator, Main, Workspace }) => {
  const root = await FileSystem.getTmpDir({ scheme: 'memfs' })
  const uri = `${root}/symbols.ts`
  const text =
    'export class Widget { value = 1; method(input: string): number { return input.length; } }\nconst widget = new Widget();\nwidget.method("hello");\n'
  await FileSystem.mkdir(root)
  await FileSystem.writeFile(uri, text)
  await Workspace.setUri(root)
  await Main.openUri(uri)
  await Editor.setCursor(2, 15)
  const document = { languageId: 'typescript', text, uri, version: 1 }
  const symbols = (await Command.executeExtensionCommand(
    'ExtensionApi.executeLanguageProvider',
    'document symbol',
    'provideDocumentSymbols',
    document,
  )) as { name: string; children?: { name: string }[]; selectionStartOffset: number; selectionEndOffset: number }[]
  const widget = symbols.find((symbol) => symbol.name === 'Widget')
  if (!widget || widget.children?.map((symbol) => symbol.name).join(',') !== 'value,method')
    throw new Error(`Invalid outline: ${JSON.stringify(symbols)}`)
  if (text.slice(widget.selectionStartOffset, widget.selectionEndOffset) !== 'Widget')
    throw new Error('Invalid outline selection range')
  await Command.execute('Editor.showSignatureHelp')
  const signatureHelp = Locator('.SignatureHelp')
  await expect(signatureHelp).toContainText('widget.method(input: string): number')
}
