import type { DocumentSymbol } from '../DocumentSymbol/DocumentSymbol.ts'
import { getDocumentSymbolsFromTsResult } from '../GetDocumentSymbolsFromTsResult/GetDocumentSymbolsFromTsResult.ts'
import { getOrCreateLanguageService } from '../GetOrCreateLanguageService/GetOrCreateLanguageService.ts'

export const getDocumentSymbols2 = (textDocument: any): readonly DocumentSymbol[] => {
  const { text, uri } = textDocument
  const { fs, languageService } = getOrCreateLanguageService(uri)
  fs.writeFile(uri, text)
  const tree = languageService.getNavigationTree(uri)
  return getDocumentSymbolsFromTsResult(tree)
}
