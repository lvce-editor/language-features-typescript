// @ts-nocheck
import * as Position from '../Position/Position.ts'

/**
 * @param {vscode.TextDocument} textDocument
 * @param {import('typescript/lib/protocol').TypeDefinitionResponse['body']} tsResult
 * @returns {vscode.DefinitionResult|undefined}
 */
export const getDefinitionFromTsResult = (textDocument: any, tsResult: any): any => {
  if (!tsResult) {
    return undefined
  }
  if (tsResult.length === 0) {
    return undefined
  }
  console.warn({ tsResult })
  const firstTypeDefinition = tsResult[0]
  if (firstTypeDefinition.file === textDocument.uri) {
    const startOffset = Position.getOffset(textDocument, firstTypeDefinition.start)
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
