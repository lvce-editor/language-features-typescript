export const getEditsFromTsResult = async (Position: any, textDocument: any, tsResult) => {
  // TODO handle case when edits are for a different file
  const edits: any[] = []
  for (const item of tsResult) {
    for (const textChange of item.textChanges) {
      const { start, end, newText } = textChange
      const startOffset = await Position.getOffset(textDocument, {
        rowIndex: start.line - 1,
        columnIndex: start.offset - 1,
      })
      const endOffset = await Position.getOffset(textDocument, {
        rowIndex: end.line - 1,
        columnIndex: end.offset - 1,
      })
      edits.push({
        startOffset,
        endOffset,
        inserted: newText,
      })
    }
  }
  return edits
}
