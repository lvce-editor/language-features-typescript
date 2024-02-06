import * as LanguageId from '../LanguageId/LanguageId.js'
import * as Selection from '../Selection/Selection.js'

export const languageId = LanguageId.TypeScript

/**
 * @type {vscode.HoverProvider['provideHover']}
 */
export const provideSelections = async (textDocument, positions) => {
  // TODO expand selections
  const newSelections = await Selection.expandSelection(textDocument, positions)
  console.log('expand selections', { newSelections })
  return []
}
