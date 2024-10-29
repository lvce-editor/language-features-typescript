export const getRenameResultFromTsResult = async (textDocument, Position, tsResult, newName) => {
  if (!tsResult.info.canRename) {
    // TODO how to handle this kind of error vs programmer error?
    throw new Error('rename was not successful')
  }
  const workspaceEdits = []
  for (const spanGroup of tsResult.locs) {
    const edits = []
    for (const textSpan of spanGroup.locs) {
      const prefixText = textSpan.prefixText || ''
      const suffixText = textSpan.suffixText || ''
      const inserted = prefixText + newName + suffixText
      const offset = await Position.getOffset(textDocument, textSpan.start)
      console.log({ offset })
      edits.push({
        offset,
        inserted,
        deleted: 0,
      })
    }
    workspaceEdits.push({
      file: spanGroup.file,
      edits,
    })
  }
  return {
    edits: workspaceEdits,
  }
}
