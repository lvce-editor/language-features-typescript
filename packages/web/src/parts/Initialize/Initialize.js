import * as GetTypeScriptPath from '../GetTypeScriptPath/GetTypeScriptPath.js'
import * as LanguageServiceState from '../LanguageServiceState/LanguageServiceState.js'
import * as LoadTypeScript from '../LoadTypeScript/LoadTypeScript.js'
import * as TypeScriptLanguageHost from '../TypeScriptLanguageHost/TypeScriptLanguageHost.js'

export const initialize = async () => {
  const typescriptPath = GetTypeScriptPath.getTypeScriptPath()
  const typescript = await LoadTypeScript.loadTypeScript(typescriptPath)
  const languageServiceHost = TypeScriptLanguageHost.create(typescript)
  const languageService = typescript.createLanguageService(languageServiceHost, undefined, false)
  LanguageServiceState.set(languageService)
}
