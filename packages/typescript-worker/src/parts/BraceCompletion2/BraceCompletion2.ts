import * as Assert from '../Assert/Assert.ts'
import { getOrCreateLanguageService } from '../GetOrCreateLanguageService/GetOrCreateLanguageService.ts'

export const provideBraceCompletion = (textDocument: any, offset: number, openingBrace: string): boolean => {
  const uri = textDocument.uri
  Assert.string(uri)
  Assert.number(offset)
  Assert.string(openingBrace)
  const { languageService, fs } = getOrCreateLanguageService(uri)
  fs.writeFile(uri, textDocument.text)
  return languageService.isValidBraceCompletionAtPosition(uri, offset, openingBrace.charCodeAt(0))
}
