// @ts-nocheck
import * as Assert from '../Assert/Assert.js'
import * as Position from '../Position/Position.js'
import * as Rpc from '../Rpc/Rpc.js'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.js'

const getEntryNames = (name, completionItem) => {
  if (completionItem) {
    return [
      {
        name,
        source: completionItem.source,
        data: completionItem.data,
      },
    ]
  }
  return [name]
}
/**
 * @type {vscode.CompletionProvider['provideCompletions']}
 */
export const resolveCompletion = async (textDocument, offset, name, completionItem) => {
  const uri = textDocument.uri
  Assert.string(uri)
  await TextDocumentSync.openTextDocuments([textDocument])
  const tsPosition = Position.getTsPosition(textDocument, offset)
  const entryNames = getEntryNames(name, completionItem)
  const tsResult = await Rpc.invoke('ResolveCompletion.resolveCompletion', {
    file: textDocument.uri,
    line: tsPosition.line,
    offset: tsPosition.offset,
    entryNames,
  })
  return tsResult
}
