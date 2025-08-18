import ts from 'typescript'
import * as Assert from '../Assert/Assert.ts'
import { getEditsFromTsResult2 } from '../GetOrganizeImportEditsFromTsResult2/GetOrgnizeImportEditsFromTsResult2.ts'
import * as LanguageServices from '../LanguageServices/LanguageServices.ts'

export const organizeImports2 = async (textDocument: any) => {
  const uri = textDocument.uri
  Assert.string(uri)
  const id = 1
  const { fs, languageService } = LanguageServices.get(id)
  fs.writeFile(textDocument.uri, textDocument.text)
  const tsResult = languageService.organizeImports(
    { fileName: textDocument.uri, type: 'file', mode: ts.OrganizeImportsMode.All },
    {},
    {},
  )
  return getEditsFromTsResult2(tsResult)
}
