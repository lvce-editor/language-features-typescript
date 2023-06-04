import * as Position from '../Position/Position.js'

/**
 * @param {vscode.TextDocument} textDocument
 * @param {readonly import('typescript/lib/protocol').DefinitionInfo[]} tsResult
 * @returns {vscode.DefinitionResult|undefined}
 */
export const getDefinitionFromTsResult = (textDocument, tsResult) => {
  if (tsResult.length === 0) {
    return undefined
  }
  const firstDefinition = tsResult[0]
  if (firstDefinition.file === textDocument.uri) {
    const startOffset = Position.getOffset(textDocument, firstDefinition.start)
    const endOffset = Position.getOffset(textDocument, firstDefinition.end)
    return {
      uri: firstDefinition.file,
      startOffset,
      endOffset,
    }
  }
  // TODO want offset based result
  // probably would require to read file and map position to offset (very slow)
  const startOffset = 0
  const endOffset = 0
  return {
    uri: firstDefinition.file,
    startRowIndex: firstDefinition.contextStart.line - 1,
    startColumnIndex: firstDefinition.contextStart.offset - 1,
    endRowIndex: firstDefinition.contextEnd.line - 1,
    endColumnIndex: firstDefinition.contextEnd.offset - 1,
    startOffset,
    endOffset,
  }
}
