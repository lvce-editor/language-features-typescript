// @ts-nocheck
import * as GetImplementationFromTsResult from '../GetImplementationFromTsResult/GetImplementationFromTsResult.ts'
import * as Position from '../Position/Position.ts'
import * as Rpc from '../Rpc/Rpc.ts'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.ts'

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
