import * as GetTypeDefinitionFromTsResult from '../GetTypeDefinitionFromTsResult/GetTypeDefinitionFromTsResult.js'
import * as LanguageId from '../LanguageId/LanguageId.js'
import * as TypeDefinition from '../TypeDefinition/TypeDefinition.js'

export const languageId = LanguageId.TypeScript

/**
 * @type{vscode.DefinitionProvider['provideDefinition']}
 */
export const provideTypeDefinition = async (textDocument, offset) => {
  const tsResult = await TypeDefinition.getTypeDefinition(textDocument, offset)
  const definition = GetTypeDefinitionFromTsResult.getDefinitionFromTsResult(textDocument, tsResult)
  return definition
}
