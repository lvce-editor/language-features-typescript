import { createFileSystem } from '../CreateFileSystem/CreateFileSystem.ts'
import { createTypeScriptLanguageService } from '../CreateTypeScriptLanguageService/CreateTypeScriptLanguageService.ts'
import { getHoverFromTsResult2 } from '../GetHoverFromTsResult2/GetHoverFromTsResult2.ts'
import { getTypeScriptPath } from '../GetTypeScriptPath/GetTypeScriptPath.ts'
import { loadTypeScript } from '../LoadTypeScript/LoadTypeScript.ts'

export const getHover2 = async (textDocument: any, offset: number) => {
  const tsPath = getTypeScriptPath()
  const ts = await loadTypeScript(tsPath)
  const fs = createFileSystem()
  const languageService = createTypeScriptLanguageService(ts, fs)
  fs.writeFile(textDocument.uri, textDocument.text)
  const tsResult = languageService.getQuickInfoAtPosition(textDocument.uri, offset)
  const hover = getHoverFromTsResult2(tsResult)
  return hover
}
