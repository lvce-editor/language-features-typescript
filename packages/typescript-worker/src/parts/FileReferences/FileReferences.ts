import * as TypeScriptRpc from '../TypeScriptRpc/TypeScriptRpc.ts'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.ts'

const getFileReference = (ref: any) => {
  return {
    uri: ref.file,
    startOffset: 0,
    endOffset: 0,
    lineText: ref.lineText,
  }
}

const getFileReferencesFromTsResult = (tsResult: any) => {
  const refs = tsResult.refs
  return refs.map(getFileReference)
}

export const getFileReferences = async (textDocument) => {
  await TextDocumentSync.openTextDocuments([textDocument])
  const tsResult = await TypeScriptRpc.invoke('References.getFileReferences', {
    file: textDocument.uri,
  })
  return getFileReferencesFromTsResult(tsResult)
}
