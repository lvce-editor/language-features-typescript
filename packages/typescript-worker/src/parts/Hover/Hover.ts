import * as Assert from '../Assert/Assert.ts'
import type { CommonRpc } from '../CommonRpc/CommonRpc.ts'
import * as GetHoverFromTsResult from '../GetHoverFromTsResult/GetHoverFromTsResult.ts'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.ts'
import type * as TypeScriptProtocol from '../TypeScriptProtocol/TypeScriptProtocol.ts'

export const getHover = async (typescriptRpc: CommonRpc, Position: any, textDocument: any, offset: number) => {
  const uri = textDocument.uri
  Assert.string(uri)
  Assert.number(offset)
  await TextDocumentSync.openTextDocuments2(typescriptRpc, [textDocument])
  const tsPosition = await Position.getTsPosition(textDocument, offset)
  const tsResult = await typescriptRpc.invoke<TypeScriptProtocol.QuickInfoResponseBody>('Hover.getHover', {
    file: textDocument.uri,
    line: tsPosition.line,
    offset: tsPosition.offset,
  })
  const hover = GetHoverFromTsResult.getHoverFromTsResult(tsResult)
  return hover
}
