import { createFileSystem } from '../CreateFileSystem/CreateFileSystem.ts'
import { createTypeScriptLanguageService } from '../CreateTypeScriptLanguageService/CreateTypeScriptLanguageService.ts'
import { getTypeScriptPath } from '../GetTypeScriptPath/GetTypeScriptPath.ts'
import * as LanguageServices from '../LanguageServices/LanguageServices.ts'
import { loadTypeScript } from '../LoadTypeScript/LoadTypeScript.ts'

export const initialize = async (path: string) => {
  const tsPath = getTypeScriptPath()
  console.time('load')
  const ts = await loadTypeScript(tsPath)
  console.timeEnd('load')
  const fs = createFileSystem()
  const languageService = await createTypeScriptLanguageService(ts, fs)
  const id = 1
  LanguageServices.set(id, languageService, fs)
}
