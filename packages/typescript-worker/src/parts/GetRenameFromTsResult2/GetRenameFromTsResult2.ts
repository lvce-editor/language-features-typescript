import type ts from 'typescript'

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
  const workspaceEdits: any[] = []
  // TODO
  for (const spanGroup of tsLocations) {
    const edits: any[] = []
    edits.push({
      offset: spanGroup.textSpan.start,
      inserted: newName,
      deleted: spanGroup.textSpan.length,
    })
    workspaceEdits.push({
      uri: spanGroup.fileName,
      edits,
    })
  }
  return {
    edits: workspaceEdits,
  }
}
