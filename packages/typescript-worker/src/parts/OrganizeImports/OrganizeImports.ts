import * as Assert from '../Assert/Assert.ts'
import * as TypeScriptRpc from '../TypeScriptRpc/TypeScriptRpc.ts'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.ts'

export const organizeImports = async (textDocument) => {
  const uri = textDocument.uri
  Assert.string(uri)
  await TextDocumentSync.openTextDocuments([textDocument])
  const tsResult = await TypeScriptRpc.invoke('OrganizeImports.organizeImports', {
    scope: {
      type: 'file',
      args: {
        file: textDocument.uri,
      },
    },
    mode: 'All',
  })
  return tsResult
}
