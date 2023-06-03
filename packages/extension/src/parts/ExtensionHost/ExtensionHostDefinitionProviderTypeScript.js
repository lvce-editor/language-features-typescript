import * as Definition from '../Definition/Definition.js'
import * as GetDefinitionFromTsResult from '../GetDefinitionFromTsResult/GetDefinitionFromTsResult.js'

export const languageId = 'typescript'

/**
 * @type{vscode.DefinitionProvider['provideDefinition']}
 */
export const provideDefinition = async (textDocument, offset) => {
  const tsResult = await Definition.getDefinition(textDocument, offset)
  const definition = GetDefinitionFromTsResult.getDefinitionFromTsResult(
    textDocument,
    tsResult
  )
  return definition
}
