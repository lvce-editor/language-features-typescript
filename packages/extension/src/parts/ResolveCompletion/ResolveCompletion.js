import * as Assert from '../Assert/Assert.js'
import * as Position from '../Position/Position.js'
import * as Rpc from '../Rpc/Rpc.js'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.js'

/**
 * @type {vscode.CompletionProvider['provideCompletions']}
 */
export const resolveCompletion = async (textDocument, offset, name) => {
  const uri = textDocument.uri
  Assert.string(uri)
  await TextDocumentSync.openTextDocuments([textDocument])
  const tsPosition = Position.getTsPosition(textDocument, offset)
  const tsResult = await Rpc.invoke('ResolveCompletion.resolveCompletion', {
    file: textDocument.uri,
    line: tsPosition.line,
    offset: tsPosition.offset,
    entryNames: [name],
  })
  return tsResult
}
