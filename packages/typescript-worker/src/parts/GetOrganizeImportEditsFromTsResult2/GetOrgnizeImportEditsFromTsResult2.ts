import type ts from 'typescript'

export const getEditsFromTsResult2 = async (tsResult: readonly ts.FileTextChanges[]) => {
  // TODO handle case when edits are for a different file
  const edits: any[] = []
  for (const item of tsResult) {
    for (const textChange of item.textChanges) {
      const { span, newText } = textChange
      const startOffset = span.start
      const endOffset = span.start + span.length
      edits.push({
        startOffset,
        endOffset,
        inserted: newText,
      })
    }
  }
  return edits
}
