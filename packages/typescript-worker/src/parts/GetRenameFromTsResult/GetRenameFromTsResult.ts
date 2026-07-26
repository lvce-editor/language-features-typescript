export const getRenameResultFromTsResult = async (textDocument, Position, tsResult, newName) => {
  if (!tsResult.info.canRename) {
    // TODO how to handle this kind of error vs programmer error?
    throw new Error('rename was not successful')
  }
  const workspaceEdits: any[] = []
  for (const spanGroup of tsResult.locs) {
    const edits: any[] = []
    for (const textSpan of spanGroup.locs) {
      const prefixText = textSpan.prefixText || ''
      const suffixText = textSpan.suffixText || ''
      const inserted = prefixText + newName + suffixText
      const offset = await Position.getOffset(textDocument, {
        columnIndex: textSpan.start.offset - 1,
        rowIndex: textSpan.start.line - 1,
      })
      edits.push({
        deleted: 0,
        inserted,
        offset,
      })
    }
    workspaceEdits.push({
      edits,
      file: spanGroup.file,
    })
  }
  return {
    edits: workspaceEdits,
  }
}
