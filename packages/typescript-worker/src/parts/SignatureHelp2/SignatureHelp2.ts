import { getOrCreateLanguageService } from '../GetOrCreateLanguageService/GetOrCreateLanguageService.ts'
import { getSignatureHelpFromTsResult } from '../GetSignatureHelpFromTsResult/GetSignatureHelpFromTsResult.ts'

export const getSignatureHelp2 = async (textDocument: any, offset: number) => {
  const { fs, languageService } = getOrCreateLanguageService(textDocument.uri)
  fs.writeFile(textDocument.uri, textDocument.text)
  const result = languageService.getSignatureHelpItems(textDocument.uri, offset, undefined)
  return getSignatureHelpFromTsResult(result)
}
