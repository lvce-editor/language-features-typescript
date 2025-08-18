import * as Assert from '../Assert/Assert.ts'
import { getCompletionFromTsResult2 } from '../GetCompletionFromTsResult2/GetCompletionFromTsResult2.ts'
import * as LanguageServices from '../LanguageServices/LanguageServices.ts'

export const getCompletion2 = async (textDocument: any, offset: number) => {
  const uri = textDocument.uri
  Assert.string(uri)
  const id = 1
  const { languageService, fs } = LanguageServices.get(id)
  fs.writeFile(textDocument.uri, textDocument.text)
  const tsResult = languageService.getCompletionsAtPosition(textDocument.uri, offset, {})
  const completions = getCompletionFromTsResult2(tsResult)
  return completions
}
