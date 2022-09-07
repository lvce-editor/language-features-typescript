import * as TsServerRequests from 'ts-server-requests'
import * as Position from '../Position/Position.js'

export const languageId = 'typescript'

/**
 * @param {vscode.TextDocument} textDocument
 * @param {import('typescript/lib/protocol').TypeDefinitionResponse['body']} tsResult
 * @returns {vscode.DefinitionResult|undefined}
 */
export const getDefinitionFromTsResult = (textDocument, tsResult) => {
  if (!tsResult) {
    return undefined
  }
  if (tsResult.length === 0) {
    return undefined
  }
  const firstTypeDefinition = tsResult[0]
  if (firstTypeDefinition.file === textDocument.uri) {
    const startOffset = Position.getOffset(
      textDocument,
      firstTypeDefinition.start
    )
    const endOffset = Position.getOffset(textDocument, firstTypeDefinition.end)
    return {
      uri: firstTypeDefinition.file,
      startOffset,
      endOffset,
    }
  }
  // TODO want offset based result
  // probably would require to read file and map position to offset (very slow)
  const startOffset = 0
  const endOffset = 0
  return {
    uri: firstTypeDefinition.file,
    startOffset,
    endOffset,
  }
}

/**
 * @type{vscode.DefinitionProvider['provideDefinition']}
 */
export const provideTypeDefinition = async (textDocument, offset) => {
  const tsPosition = Position.getTsPosition(textDocument, offset)
  const tsResult = await TsServerRequests.typeDefinition({
    file: textDocument.uri,
    line: tsPosition.line,
    offset: tsPosition.offset,
  })
  const definition = getDefinitionFromTsResult(textDocument, tsResult)
  return definition
}
