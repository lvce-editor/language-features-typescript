import * as OrganizeImports from '../OrganizeImports/OrganizeImports.js'

export const languageId = 'typescript'

const getEditsFromTsResult = (textDocument, tsResult) => {
  // TODO handle case when edits are for a different file
  const edits = []
  for (const item of tsResult) {
    for (const textChange of item.textChanges) {
      const { start, end, newText } = textChange
      const startOffset = vscode.getOffset(textDocument, { rowIndex: start.line - 1, columnIndex: start.offset - 1 })
      const endOffset = vscode.getOffset(textDocument, {
        rowIndex: end.line - 1,
        columnIndex: end.offset - 1,
      })
      edits.push({
        startOffset,
        endOffset,
        inserted: newText,
      })
    }
  }
  return edits
}

const organizeImports = {
  kind: 'source.organizeImports', // TODO use numeric code action type
  name: 'Organize Imports',
  async execute(textDocument) {
    const tsResult = await OrganizeImports.organizeImports(textDocument)
    const edits = getEditsFromTsResult(textDocument, tsResult)
    return edits
  },
}

/**
 * @type {vscode.ClosingTagProvider['provideClosingTag']}
 */
export const provideCodeActions = async () => {
  return [organizeImports]
}
