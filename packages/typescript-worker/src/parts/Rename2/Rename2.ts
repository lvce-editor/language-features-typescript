import * as Assert from '../Assert/Assert.ts'
import { getRenameResultFromTsResult2 } from '../GetRenameFromTsResult2/GetRenameFromTsResult2.ts'
import * as LanguageServices from '../LanguageServices/LanguageServices.ts'

export const rename2 = async (textDocument: any, offset: number, newName: string) => {
  const uri = textDocument.uri
  Assert.string(uri)
  const id = 1
  const { languageService, fs } = LanguageServices.get(id)
  fs.writeFile(textDocument.uri, textDocument.text)

  const tsResult = languageService.getRenameInfo(textDocument.uri, offset, {})
  const tsLocations = languageService.findRenameLocations(textDocument.uri, offset, false, false, {})
  const rename = await getRenameResultFromTsResult2(textDocument.text, tsResult, tsLocations, newName)
  return rename
}
