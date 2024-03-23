// @ts-nocheck
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
  const { start, end, file } = firstDefinition
  if (file === textDocument.uri) {
    const startOffset = Position.getOffset(textDocument, start)
    const endOffset = Position.getOffset(textDocument, end)
    return {
      uri: file,
      startOffset,
      endOffset,
    }
  }
  // TODO want offset based result
  // probably would require to read file and map position to offset (very slow)
  const startOffset = 0
  const endOffset = 0
  return {
    uri: file,
    startRowIndex: start.line - 1,
    startColumnIndex: start.offset - 1,
    endRowIndex: end.line - 1,
    endColumnIndex: end.offset - 1,
    startOffset,
    endOffset,
  }
}
