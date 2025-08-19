import type ts from 'typescript'
import { getOffset } from '../GetOffset/GetOffset.ts'

export const getRenameResultFromTsResult2 = async (
  text: string,
  tsResult: ts.RenameInfo,
  tsLocations: readonly ts.RenameLocation[],
  newName: string,
) => {
  if (!tsResult.canRename) {
    // TODO how to handle this kind of error vs programmer error?
    throw new Error('rename was not successful')
  }
  const workspaceEdits = []
  tsResult.triggerSpan
  // TODO
  for (const spanGroup of tsLocations) {
    const edits = []
    // @ts-ignore
    for (const textSpan of spanGroup.locs) {
      const prefixText = textSpan.prefixText || ''
      const suffixText = textSpan.suffixText || ''
      const inserted = prefixText + newName + suffixText
      const offset = getOffset(text, textSpan.start.line - 1, textSpan.start.offset - 1)
      edits.push({
        offset,
        inserted,
        deleted: 0,
      })
    }
    workspaceEdits.push({
      // @ts-ignore
      file: spanGroup.file,
      edits,
    })
  }
  return {
    edits: workspaceEdits,
  }
}
