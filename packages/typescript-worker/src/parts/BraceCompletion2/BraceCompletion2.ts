import * as Assert from '../Assert/Assert.ts'
import { getOrCreateLanguageService } from '../GetOrCreateLanguageService/GetOrCreateLanguageService.ts'

export const provideBraceCompletion = (textDocument: any, offset: number, openingBrace: string): boolean => {
  const { uri } = textDocument
  Assert.string(uri)
  Assert.number(offset)
  Assert.string(openingBrace)
  const { fs, languageService } = getOrCreateLanguageService(uri)
  fs.writeFile(uri, textDocument.text)
  return languageService.isValidBraceCompletionAtPosition(uri, offset, openingBrace.codePointAt(0) ?? 0)
}
