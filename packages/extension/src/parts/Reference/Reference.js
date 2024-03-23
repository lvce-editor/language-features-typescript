// @ts-nocheck
import * as Position from '../Position/Position.js'
import * as Rpc from '../Rpc/Rpc.js'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.js'

/**
 * @type{vscode.ReferenceProvider['provideReferences']}
 */
export const getReferences = async (textDocument, offset) => {
  await TextDocumentSync.openTextDocuments([textDocument])
  const tsPosition = Position.getTsPosition(textDocument, offset)
  const tsResult = await Rpc.invoke('References.getReferences', {
    file: textDocument.uri,
    line: tsPosition.line,
    offset: tsPosition.offset,
  })
  return tsResult
}
