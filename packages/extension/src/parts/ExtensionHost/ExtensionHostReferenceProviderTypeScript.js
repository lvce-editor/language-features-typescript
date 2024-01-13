import * as FileReferences from '../FileReferences/FileReferences.js'
import * as GetReferencesFromTsResult from '../GetReferencesFromTsResult/GetReferencesFromTsResult.js'
import * as LanguageId from '../LanguageId/LanguageId.js'
import * as References from '../Reference/Reference.js'

export const languageId = LanguageId.TypeScript

/**
 * @type{vscode.ReferenceProvider['provideReferences']}
 */
export const provideReferences = async (textDocument, offset) => {
  const tsResult = await References.getReferences(textDocument, offset)
  const references = GetReferencesFromTsResult.getReferencesFromTsResult(textDocument, tsResult)
  return references
}

export const provideFileReferences = async (textDocument) => {
  const tsResult = await FileReferences.getFileReferences(textDocument)
  const fileReferences = tsResult
  return fileReferences
}
