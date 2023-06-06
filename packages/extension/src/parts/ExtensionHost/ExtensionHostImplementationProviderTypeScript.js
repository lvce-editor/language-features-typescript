import * as GetImplementationFromTsResult from '../GetImplementationFromTsResult/GetImplementationFromTsResult.js'
import * as Implementation from '../Implementation/Implementation.js'
import * as LanguageId from '../LanguageId/LanguageId.js'

export const languageId = LanguageId.TypeScript

/**
 * @type{vscode.ImplementationProvider['provideImplementations']}
 */
export const provideImplementations = async (textDocument, offset) => {
  const tsResult = await Implementation.getImplementations(textDocument, offset)
  const implementations = await GetImplementationFromTsResult.getImplementationsFromTsResult(textDocument, tsResult)
  return implementations
}
