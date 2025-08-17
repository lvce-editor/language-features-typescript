import { createFileSystem } from '../CreateFileSystem/CreateFileSystem.ts'
import { createTypeScriptLanguageService } from '../CreateTypeScriptLanguageService/CreateTypeScriptLanguageService.ts'
import { getTypeScriptPath } from '../GetTypeScriptPath/GetTypeScriptPath.ts'
import { loadTypeScript } from '../LoadTypeScript/LoadTypeScript.ts'

export const getHover2 = async (textDocument: any, offset: number) => {
  const tsPath = getTypeScriptPath()
  console.time('load')
  const ts = await loadTypeScript(tsPath)
  const fs = createFileSystem()
  const languageService = createTypeScriptLanguageService(ts, fs)
  console.timeEnd('load')
  console.time('result')
  const result = languageService.getQuickInfoAtPosition(textDocument.uri, offset)
  console.timeEnd('result')
  return result
}
