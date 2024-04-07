import * as Assert from '../Assert/Assert.ts'
import type { CommonRpc } from '../CommonRpc/CommonRpc.ts'
import * as GetResolvedCompletionItemFromTsResult from '../GetResolvedCompletionItemFromTsResult/GetResolvedCompletionItemFromTsResult.ts'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.ts'
import type * as TypeScriptProtocol from '../TypeScriptProtocol/TypeScriptProtocol.ts'

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

export const resolveCompletion = async (
  typescriptRpc: CommonRpc,
  Position: any,
  textDocument: any,
  offset: number,
  name: string,
  completionItem: any,
) => {
  const uri = textDocument.uri
  Assert.string(uri)
  await TextDocumentSync.openTextDocuments2(typescriptRpc, [textDocument])
  const tsPosition = await Position.getTsPosition(textDocument, offset)
  const entryNames = getEntryNames(name, completionItem)
  const tsResult = await typescriptRpc.invoke<TypeScriptProtocol.CompletionEntryDetails[]>(
    'ResolveCompletion.resolveCompletion',
    {
      file: textDocument.uri,
      line: tsPosition.line,
      offset: tsPosition.offset,
      entryNames,
    },
  )
  const completion = GetResolvedCompletionItemFromTsResult.getResolveCompletionItemFromTsResult(tsResult)
  return completion
}
