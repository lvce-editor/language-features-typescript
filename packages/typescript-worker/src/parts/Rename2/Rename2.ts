import * as Assert from '../Assert/Assert.ts'
import { getOrCreateLanguageService } from '../GetOrCreateLanguageService/GetOrCreateLanguageService.ts'
import { getRenameResultFromTsResult2 } from '../GetRenameFromTsResult2/GetRenameFromTsResult2.ts'

export const rename2 = async (textDocument: any, offset: number, newName: string) => {
  const uri = textDocument.uri
  Assert.string(uri)
  const { languageService, fs } = getOrCreateLanguageService(textDocument.uri)
  fs.writeFile(textDocument.uri, textDocument.text)
  const tsResult = languageService.getRenameInfo(textDocument.uri, offset, {})
  const tsLocations = languageService.findRenameLocations(textDocument.uri, offset, false, false, {})
  const rename = await getRenameResultFromTsResult2(textDocument.text, tsResult, tsLocations as any, newName)
  return rename
}
