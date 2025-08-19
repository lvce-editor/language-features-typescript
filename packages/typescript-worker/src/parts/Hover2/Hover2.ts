import { getHoverFromTsResult2 } from '../GetHoverFromTsResult2/GetHoverFromTsResult2.ts'
import { getOrCreateLanguageService } from '../GetOrCreateLanguageService/GetOrCreateLanguageService.ts'

export const getHover2 = async (textDocument: any, offset: number) => {
  const { languageService, fs } = getOrCreateLanguageService(textDocument.uri)
  fs.writeFile(textDocument.uri, textDocument.text)
  const tsResult = languageService.getQuickInfoAtPosition(textDocument.uri, offset)
  const hover = getHoverFromTsResult2(tsResult)
  return hover
}
