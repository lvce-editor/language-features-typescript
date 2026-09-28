import type { CommonRpc } from '../CommonRpc/CommonRpc.ts'
import * as Assert from '../Assert/Assert.ts'
import { getOrCreateLanguageService } from '../GetOrCreateLanguageService/GetOrCreateLanguageService.ts'
import { getEditsFromTsResult2 } from '../GetOrganizeImportEditsFromTsResult2/GetOrgnizeImportEditsFromTsResult2.ts'

const fixMissingImport = 'fixMissingImport'

export const addMissingImports = async (typescriptRpc: CommonRpc, Position: any, textDocument: any) => {
  const { uri } = textDocument
  Assert.string(uri)
  const { fs, languageService } = getOrCreateLanguageService(uri)
  fs.writeFile(uri, textDocument.text)
  const tsResult = languageService.getCombinedCodeFix({ fileName: uri, type: 'file' }, fixMissingImport, {}, {})
  return getEditsFromTsResult2(tsResult.changes)
}
