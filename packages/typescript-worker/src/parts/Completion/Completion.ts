import * as Assert from '../Assert/Assert.ts'
import type { CommonRpc } from '../CommonRpc/CommonRpc.ts'
import * as FileSystem from '../FileSystem/FileSystem.ts'
import * as GetCompletionFromTsResult from '../GetCompletionFromTsResult/GetCompletionFromTsResult.ts'
import * as TypeScriptLanguageService from '../TypeScriptLanguageService/TypeScriptLanguageService.ts'

export const getCompletion = async (typeScriptRpc: CommonRpc, Position: any, textDocument: any, offset: number) => {
  const uri = textDocument.uri
  Assert.string(uri)

  FileSystem.writeFile(uri, textDocument.text)
  const languageService = TypeScriptLanguageService.languageService

  const completions1 = languageService.getCompletionsAtPosition(uri, offset, {})

  completions1.entries
  const completions = GetCompletionFromTsResult.getCompletionFromTsResult(completions1)
  return completions
}
