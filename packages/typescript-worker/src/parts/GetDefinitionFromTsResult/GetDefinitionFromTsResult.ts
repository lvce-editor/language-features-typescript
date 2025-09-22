import type * as TypeScriptProtocol from '../TypeScriptProtocol/TypeScriptProtocol.ts'

export const getDefinitionFromTsResult = async (
  textDocument: any,
  Position: any,
  tsResult: readonly TypeScriptProtocol.DefinitionInfo[],
) => {
  if (tsResult.length === 0) {
    return undefined
  }
  const firstDefinition = tsResult[0]
  const { start, end, file } = firstDefinition
  if (file === textDocument.uri) {
    const startOffset = await Position.getOffset(textDocument, {
      rowIndex: start.line - 1,
      columnIndex: start.offset - 1,
    })
    const endOffset = await Position.getOffset(textDocument, {
      rowIndex: end.line - 1,
      columnIndex: end.offset - 1,
    })
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
