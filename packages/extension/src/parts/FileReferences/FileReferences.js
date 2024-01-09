import * as Rpc from '../Rpc/Rpc.js'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.js'

const getFileReference = (ref) => {
  return ref
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
