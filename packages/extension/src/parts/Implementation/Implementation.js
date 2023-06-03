import * as GetImplementationFromTsResult from '../GetImplementationFromTsResult/GetImplementationFromTsResult.js'
import * as Position from '../Position/Position.js'
import * as Rpc from '../Rpc/Rpc.js'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.js'

/**
 * @type{vscode.ImplementationProvider['provideImplementations']}
 */
export const getImplementations = async (textDocument, offset) => {
  await TextDocumentSync.openTextDocuments([textDocument])
  const uri = textDocument.uri
  const tsPosition = Position.getTsPosition(textDocument, offset)
  const tsResult = await Rpc.invoke('Implementation.getImplementations', {
    file: uri,
    line: tsPosition.line,
    offset: tsPosition.offset,
  })
  return tsResult
}
