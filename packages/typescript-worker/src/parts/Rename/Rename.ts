import * as Assert from '../Assert/Assert.ts'
import type { CommonRpc } from '../CommonRpc/CommonRpc.ts'
import * as GetRenameFromTsResult from '../GetRenameFromTsResult/GetRenameFromTsResult.ts'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.ts'
import type * as TypeScriptProtocol from '../TypeScriptProtocol/TypeScriptProtocol.ts'

export const rename = async (
  typeScriptRpc: CommonRpc,
  Position: any,
  textDocument: any,
  offset: number,
  newName: string,
) => {
  const uri = textDocument.uri
  Assert.string(uri)
  await TextDocumentSync.openTextDocuments2(typeScriptRpc, [textDocument])
  const tsPosition = await Position.getTsPosition(textDocument, offset)
  const tsResult = await typeScriptRpc.invoke<TypeScriptProtocol.RenameInfo>('Rename.rename', {
    file: textDocument.uri,
    line: tsPosition.line,
    offset: tsPosition.offset,
    newName,
  })
  const rename = await GetRenameFromTsResult.getRenameResultFromTsResult(textDocument, tsResult, newName)
  return rename
}
