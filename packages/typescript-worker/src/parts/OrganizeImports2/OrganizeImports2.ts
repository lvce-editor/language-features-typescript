import * as Assert from '../Assert/Assert.ts'
import { getOrCreateLanguageService } from '../GetOrCreateLanguageService/GetOrCreateLanguageService.ts'
import { getEditsFromTsResult2 } from '../GetOrganizeImportEditsFromTsResult2/GetOrgnizeImportEditsFromTsResult2.ts'

export const organizeImports2 = async (textDocument: any) => {
  const uri = textDocument.uri
  Assert.string(uri)
  const { fs, languageService } = getOrCreateLanguageService(textDocument.uri)
  fs.writeFile(textDocument.uri, textDocument.text)
  const tsResult = languageService.organizeImports({ fileName: textDocument.uri, type: 'file' }, {}, {})
  return getEditsFromTsResult2(tsResult)
}
