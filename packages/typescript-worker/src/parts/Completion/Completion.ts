import * as Assert from '../Assert/Assert.ts'
import type { CommonRpc } from '../CommonRpc/CommonRpc.ts'
import * as GetCompletionFromTsResult from '../GetCompletionFromTsResult/GetCompletionFromTsResult.ts'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.ts'
import type * as TypeScriptProtocol from '../TypeScriptProtocol/TypeScriptProtocol.ts'
import * as TypeScriptUrl from '../TypeScriptUrl/TypeScriptUrl.ts'
import * as LoadTypeScript from '../LoadTypeScript/LoadTypeScript.ts'
import * as TypeScriptLanguageService from '../TypeScriptLanguageService/TypeScriptLanguageService.ts'
import * as FileSystem from '../FileSystem/FileSystem.ts'

export const getCompletion = async (typeScriptRpc: CommonRpc, Position: any, textDocument: any, offset: number) => {
  const uri = textDocument.uri
  Assert.string(uri)

  FileSystem.writeFile(uri, textDocument.text)
  const languageService = TypeScriptLanguageService.languageService

  const completions1 = languageService.getCompletionsAtPosition(uri, offset, {})
  console.log({ completions1 })
  console.log({ languageService })
  const typescript = await LoadTypeScript.loadTypeScript(TypeScriptUrl.typeScriptUrl)

  console.log({ typescript })
  console.log('before completion', uri)
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
