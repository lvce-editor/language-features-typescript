import * as Assert from '../Assert/Assert.ts'
import { getCompletionFromTsResult2 } from '../GetCompletionFromTsResult2/GetCompletionFromTsResult2.ts'
import { getOrCreateLanguageService } from '../GetOrCreateLanguageService/GetOrCreateLanguageService.ts'

export const getCompletion2 = async (textDocument: any, offset: number) => {
  const uri = textDocument.uri
  Assert.string(uri)
  const { languageService, fs } = getOrCreateLanguageService(uri)
  fs.writeFile(textDocument.uri, textDocument.text)
  const tsResult = languageService.getCompletionsAtPosition(textDocument.uri, offset, {})
  const completions = getCompletionFromTsResult2(tsResult)
  return completions
}
