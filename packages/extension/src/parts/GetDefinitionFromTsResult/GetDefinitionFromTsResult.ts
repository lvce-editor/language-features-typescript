// @ts-nocheck
import * as Position from '../Position/Position.ts'

/**
 * @param {vscode.TextDocument} textDocument
 * @param {readonly import('typescript/lib/protocol').DefinitionInfo[]} tsResult
 * @returns {vscode.DefinitionResult|undefined}
 */
export const getDefinitionFromTsResult = (textDocument: any, tsResult: any[]): any => {
  if (tsResult.length === 0) {
    return undefined
  }
  const firstDefinition = tsResult[0]
  const { end, file, start } = firstDefinition
  if (file === textDocument.uri) {
    const startOffset = Position.getOffset(textDocument, start)
    const endOffset = Position.getOffset(textDocument, end)
    return {
      endOffset,
      startOffset,
      uri: file,
    }
  }
  // TODO want offset based result
  // probably would require to read file and map position to offset (very slow)
  const startOffset = 0
  const endOffset = 0
  return {
    endColumnIndex: end.offset - 1,
    endOffset,
    endRowIndex: end.line - 1,
    startColumnIndex: start.offset - 1,
    startOffset,
    startRowIndex: start.line - 1,
    uri: file,
  }
}
