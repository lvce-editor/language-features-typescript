// @ts-nocheck
import * as GetTypeDefinitionFromTsResult from '../GetTypeDefinitionFromTsResult/GetTypeDefinitionFromTsResult.ts'
import * as LanguageId from '../LanguageId/LanguageId.ts'
import * as TypeDefinition from '../TypeDefinition/TypeDefinition.ts'

export const languageId = LanguageId.TypeScript

/**
 * @type{vscode.DefinitionProvider['provideDefinition']}
 */
export const provideTypeDefinition = async (textDocument, offset) => {
  const tsResult = await TypeDefinition.getTypeDefinition(textDocument, offset)
  const definition = GetTypeDefinitionFromTsResult.getDefinitionFromTsResult(textDocument, tsResult)
  return definition
}
