import { getDefinitionFromTsResult2 } from '../GetDefinitionFromTsResult2/GetDefinitionFromTsResult2.ts'
import * as LanguageServices from '../LanguageServices/LanguageServices.ts'

export const getDefinition2 = async (textDocument: any, offset: number) => {
  const id = 1
  const { fs, languageService } = LanguageServices.get(id)
  fs.writeFile(textDocument.uri, textDocument.text)
  const tsResult = languageService.getDefinitionAtPosition(textDocument.uri, offset)
  const definition = await getDefinitionFromTsResult2(textDocument, tsResult)
  return definition
}
