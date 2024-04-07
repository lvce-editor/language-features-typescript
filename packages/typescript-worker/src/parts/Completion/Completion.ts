import * as Assert from '../Assert/Assert.ts'
import type { CommonRpc } from '../CommonRpc/CommonRpc.ts'
import * as GetCompletionFromTsResult from '../GetCompletionFromTsResult/GetCompletionFromTsResult.ts'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.ts'
import type * as TypeScriptProtocol from '../TypeScriptProtocol/TypeScriptProtocol.ts'

export const getCompletion = async (typeScriptRpc: CommonRpc, Position: any, textDocument: any, offset: number) => {
  const uri = textDocument.uri
  Assert.string(uri)
  await TextDocumentSync.openTextDocuments2(typeScriptRpc, [textDocument])
  const tsPosition = await Position.getTsPosition(textDocument, offset)
  const tsResult = await typeScriptRpc.invoke<TypeScriptProtocol.CompletionInfoResponse['body']>(
    'Completion.getCompletion',
    {
      file: textDocument.uri,
      line: tsPosition.line,
      offset: tsPosition.offset,
    },
  )
  const completions = GetCompletionFromTsResult.getCompletionFromTsResult(tsResult)
  return completions
}
