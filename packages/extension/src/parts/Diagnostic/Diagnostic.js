import * as Assert from '../Assert/Assert.js'
import * as Rpc from '../Rpc/Rpc.js'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.js'

/**
 */
export const getDiagnostics = async (textDocument) => {
  const uri = textDocument.uri
  Assert.string(uri)
  await TextDocumentSync.openTextDocuments([textDocument])
  const tsResult = await Rpc.invoke('Diagnostic.getDiagnostics', {
    file: textDocument.uri,
  })
  return tsResult
}
