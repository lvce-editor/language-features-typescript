import * as LanguageId from '../LanguageId/LanguageId.js'
import * as Selection from '../Selection/Selection.js'

export const languageId = LanguageId.TypeScript

export const provideSelections = async (textDocument, positions) => {
  const newSelections = await Selection.expandSelection(textDocument, positions)
  return newSelections
}
