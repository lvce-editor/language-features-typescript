import * as Assert from '../Assert/Assert.ts'
import * as GetResolvedCompletionItemFromTsResult from '../GetResolvedCompletionItemFromTsResult/GetResolvedCompletionItemFromTsResult.ts'
import * as Position from '../Position/Position.ts'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.ts'
import * as TypeScriptRpc from '../TypeScriptRpc/TypeScriptRpc.ts'

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
  const tsPosition = await Position.getTsPosition(textDocument, offset)
  const entryNames = getEntryNames(name, completionItem)
  const tsResult = await TypeScriptRpc.invoke('ResolveCompletion.resolveCompletion', {
    file: textDocument.uri,
    line: tsPosition.line,
    offset: tsPosition.offset,
    entryNames,
  })
  const completion = GetResolvedCompletionItemFromTsResult.getResolveCompletionItemFromTsResult(tsResult)
  return completion
}
