export const getEditsFromTsResult = async (Position: any, textDocument: any, tsResult) => {
  // TODO handle case when edits are for a different file
  const edits: any[] = []
  for (const item of tsResult) {
    for (const textChange of item.textChanges) {
      const { end, newText, start } = textChange
      const startOffset = await Position.getOffset(textDocument, {
        columnIndex: start.offset - 1,
        rowIndex: start.line - 1,
      })
      const endOffset = await Position.getOffset(textDocument, {
        columnIndex: end.offset - 1,
        rowIndex: end.line - 1,
      })
      edits.push({
        endOffset,
        inserted: newText,
        startOffset,
      })
    }
  }
  return edits
}
