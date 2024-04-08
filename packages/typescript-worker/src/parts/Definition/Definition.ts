import type { CommonRpc } from '../CommonRpc/CommonRpc.ts'
import * as GetDefinitionFromTsResult from '../GetDefinitionFromTsResult/GetDefinitionFromTsResult.ts'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.ts'
import type * as TypeScriptProtocol from '../TypeScriptProtocol/TypeScriptProtocol.ts'

export const getDefinition = async (typescriptRpc: CommonRpc, Position: any, textDocument: any, offset: number) => {
  await TextDocumentSync.openTextDocuments2(typescriptRpc, [textDocument])
  const tsPosition = await Position.getTsPosition(textDocument, offset)
  const tsResult = await typescriptRpc.invoke<TypeScriptProtocol.DefinitionInfo[]>('Definition.getDefinition', {
    file: textDocument.uri,
    line: tsPosition.line,
    offset: tsPosition.offset,
  })
  const definition = await GetDefinitionFromTsResult.getDefinitionFromTsResult(textDocument, Position, tsResult)
  return definition
}
