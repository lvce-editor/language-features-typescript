import * as Assert from '../Assert/Assert.ts'
import type { CommonRpc } from '../CommonRpc/CommonRpc.ts'
import * as GetOrganizeImportEditsFromTsResult from '../GetOrganizeImportEditsFromTsResult/GetOrgnizeImportEditsFromTsResult.ts'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.ts'

export const organizeImports = async (typescriptRpc: CommonRpc, Position: any, textDocument: any) => {
  const uri = textDocument.uri
  Assert.string(uri)
  await TextDocumentSync.openTextDocuments2(typescriptRpc, [textDocument])
  const tsResult = await typescriptRpc.invoke('OrganizeImports.organizeImports', {
    scope: {
      type: 'file',
      args: {
        file: textDocument.uri,
      },
    },
    mode: 'All',
  })
  return GetOrganizeImportEditsFromTsResult.getEditsFromTsResult(Position, textDocument, tsResult)
}
