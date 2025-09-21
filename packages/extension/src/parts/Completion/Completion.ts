// @ts-nocheck
import * as Assert from '../Assert/Assert.ts'
import * as Position from '../Position/Position.ts'
import * as Rpc from '../Rpc/Rpc.ts'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.ts'

/**
 * @type {vscode.CompletionProvider['provideCompletions']}
 */
export const getCompletion = async (textDocument, offset) => {
  const uri = textDocument.uri
  Assert.string(uri)
  await TextDocumentSync.openTextDocuments([textDocument])
  const tsPosition = Position.getTsPosition(textDocument, offset)
  const tsResult = await Rpc.invoke('Completion.getCompletion', {
    file: textDocument.uri,
    line: tsPosition.line,
    offset: tsPosition.offset,
  })
  return tsResult
}
