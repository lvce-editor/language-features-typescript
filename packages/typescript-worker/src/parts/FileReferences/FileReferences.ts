import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.ts'
import * as TypeScriptRpc from '../TypeScriptRpc/TypeScriptRpc.ts'

const getFileReference = (ref: any) => {
  return {
    endOffset: 0,
    lineText: ref.lineText,
    startOffset: 0,
    uri: ref.file,
  }
}

const getFileReferencesFromTsResult = (tsResult: any) => {
  const { refs } = tsResult
  return refs.map(getFileReference)
}

export const getFileReferences = async (textDocument) => {
  await TextDocumentSync.openTextDocuments([textDocument])
  const tsResult = await TypeScriptRpc.invoke('References.getFileReferences', {
    file: textDocument.uri,
  })
  return getFileReferencesFromTsResult(tsResult)
}
