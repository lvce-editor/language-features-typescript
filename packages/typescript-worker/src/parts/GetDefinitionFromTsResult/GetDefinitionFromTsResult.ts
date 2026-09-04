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
  const { end, file, start } = firstDefinition
  if (file === textDocument.uri) {
    const startOffset = await Position.getOffset(textDocument, {
      columnIndex: start.offset - 1,
      rowIndex: start.line - 1,
    })
    const endOffset = await Position.getOffset(textDocument, {
      columnIndex: end.offset - 1,
      rowIndex: end.line - 1,
    })
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
