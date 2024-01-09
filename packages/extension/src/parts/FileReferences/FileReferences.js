import * as Rpc from '../Rpc/Rpc.js'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.js'

const getFileReference = (ref) => {
  return {
    uri: ref.file,
    startOffset: 0,
    endOffset: 0,
    lineText: ref.lineText,
  }
}

const getFileReferencesFromTsResult = (tsResult) => {
  const refs = tsResult.refs
  return refs.map(getFileReference)
}

export const getFileReferences = async (textDocument) => {
  await TextDocumentSync.openTextDocuments([textDocument])
  const tsResult = await Rpc.invoke('References.getFileReferences', {
    file: textDocument.uri,
  })
  return getFileReferencesFromTsResult(tsResult)
}
