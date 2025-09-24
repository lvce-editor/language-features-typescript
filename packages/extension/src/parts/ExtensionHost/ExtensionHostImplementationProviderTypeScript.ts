// @ts-nocheck
import * as GetImplementationFromTsResult from '../GetImplementationFromTsResult/GetImplementationFromTsResult.ts'
import * as Implementation from '../Implementation/Implementation.ts'
import * as LanguageId from '../LanguageId/LanguageId.ts'

export const languageId = LanguageId.TypeScript

/**
 * @type{vscode.ImplementationProvider['provideImplementations']}
 */
export const provideImplementations = async (textDocument: any, offset: number): Promise<any> => {
  const tsResult = await Implementation.getImplementations(textDocument, offset)
  const implementations = await GetImplementationFromTsResult.getImplementationsFromTsResult(textDocument, tsResult)
  return implementations
}
