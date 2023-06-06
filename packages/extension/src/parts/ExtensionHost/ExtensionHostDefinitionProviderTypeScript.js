import * as Definition from '../Definition/Definition.js'
import * as GetDefinitionFromTsResult from '../GetDefinitionFromTsResult/GetDefinitionFromTsResult.js'
import * as LanguageId from '../LanguageId/LanguageId.js'

export const languageId = LanguageId.TypeScript

/**
 * @type{vscode.DefinitionProvider['provideDefinition']}
 */
export const provideDefinition = async (textDocument, offset) => {
  const tsResult = await Definition.getDefinition(textDocument, offset)
  const definition = GetDefinitionFromTsResult.getDefinitionFromTsResult(textDocument, tsResult)
  return definition
}
