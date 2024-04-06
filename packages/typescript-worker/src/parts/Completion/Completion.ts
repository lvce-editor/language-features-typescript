import * as Assert from '../Assert/Assert.ts'
import * as Position from '../Position/Position.ts'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.ts'
import * as TypeScriptRpc from '../TypeScriptRpc/TypeScriptRpc.ts'

/**
 * @type {vscode.CompletionProvider['provideCompletions']}
 */
export const getCompletion = async (textDocument, offset) => {
  const uri = textDocument.uri
  Assert.string(uri)
  await TextDocumentSync.openTextDocuments([textDocument])
  const tsPosition = await Position.getTsPosition(textDocument, offset)
  const tsResult = await TypeScriptRpc.invoke('Completion.getCompletion', {
    file: textDocument.uri,
    line: tsPosition.line,
    offset: tsPosition.offset,
  })
  return tsResult
}
