import { getHoverFromTsResult2 } from '../GetHoverFromTsResult2/GetHoverFromTsResult2.ts'
import * as LanguageServices from '../LanguageServices/LanguageServices.ts'

export const getHover2 = async (textDocument: any, offset: number) => {
  const id = 1
  const { languageService, fs } = LanguageServices.get(id)
  fs.writeFile(textDocument.uri, textDocument.text)
  const tsResult = languageService.getQuickInfoAtPosition(textDocument.uri, offset)
  const hover = getHoverFromTsResult2(tsResult)
  return hover
}
