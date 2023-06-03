import * as GetTypeDefinitionFromTsResult from '../GetTypeDefinitionFromTsResult/GetTypeDefinitionFromTsResult.js'
import * as TypeDefinition from '../TypeDefinition/TypeDefinition.js'

export const languageId = 'typescript'

/**
 * @type{vscode.DefinitionProvider['provideDefinition']}
 */
export const provideTypeDefinition = async (textDocument, offset) => {
  const tsResult = await TypeDefinition.getTypeDefinition(textDocument, offset)
  const definition = GetTypeDefinitionFromTsResult.getDefinitionFromTsResult(
    textDocument,
    tsResult
  )
  return definition
}
