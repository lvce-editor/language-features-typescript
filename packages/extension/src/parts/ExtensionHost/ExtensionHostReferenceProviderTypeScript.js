import * as GetReferencesFromTsResult from '../GetReferencesFromTsResult/GetReferencesFromTsResult.js'
import * as References from '../Reference/Reference.js'
import * as LanguageId from '../LanguageId/LanguageId.js'

export const languageId = LanguageId.TypeScript

// TODO should this function return positions or offsets?
// when it returns offset, need to convert it to position anyway for references view
// which might be very inefficient

/**
 * @type{vscode.ReferenceProvider['provideReferences']}
 */
export const provideReferences = async (textDocument, offset) => {
  const tsResult = await References.getReferences(textDocument, offset)
  const references = GetReferencesFromTsResult.getReferencesFromTsResult(textDocument, tsResult)
  return references
}

export const provideFileReferences = async (textDocument) => {
  const tsResult = await References.getReferences(textDocument)
  const fileReferences = tsResult
  return fileReferences
}
