import * as OrganizeImports from '../OrganizeImports/OrganizeImports.js'

export const languageId = 'typescript'

const organizeImports = {
  kind: 'source.organizeImports', // TODO use numeric code action type
  name: 'Organize Imports',
  async execute(textDocument) {
    console.log({ textDocument })
    const tsResult = await OrganizeImports.organizeImports(textDocument)
    console.log({ tsResult })
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
