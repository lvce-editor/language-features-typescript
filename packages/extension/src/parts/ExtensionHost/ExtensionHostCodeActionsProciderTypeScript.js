export const languageId = 'typescript'

const organizeImports = {
  kind: 'source.organizeImports', // TODO use numeric code action type
  name: 'Organize Imports',
  execute() {
    /**
     * @type {any[]}
     */
    const edits = []
    // TODO ask tsserver for organize imports edits
    return edits
  },
}

/**
 * @type {vscode.ClosingTagProvider['provideClosingTag']}
 */
export const provideCodeActions = async () => {
  return [organizeImports]
}
