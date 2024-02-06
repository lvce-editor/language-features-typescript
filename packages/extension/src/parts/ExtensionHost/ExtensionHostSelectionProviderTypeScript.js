import * as LanguageId from '../LanguageId/LanguageId.js'

export const languageId = LanguageId.TypeScript



/**
 * @type {vscode.HoverProvider['provideHover']}
 */
export const provideSelections = async (textDocument, offset) => {
  // TODO expand selections
  console.log('expand selections', textDocument, offset)
  return []
}
