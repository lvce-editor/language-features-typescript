// @ts-nocheck
import * as Assert from '../Assert/Assert.js'
import * as Position from '../Position/Position.js'
import * as Rpc from '../Rpc/Rpc.js'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.js'

/**
 * @type {vscode.CompletionProvider['provideCompletions']}
 */
export const getHover = async (textDocument, offset) => {
  const uri = textDocument.uri
  Assert.string(uri)
  Assert.number(offset)
  await TextDocumentSync.openTextDocuments([textDocument])
  const tsPosition = Position.getTsPosition(textDocument, offset)
  const tsResult = await Rpc.invoke('Hover.getHover', {
    file: textDocument.uri,
    line: tsPosition.line,
    offset: tsPosition.offset,
  })
  console.log({ tsResult })
  return tsResult
}
