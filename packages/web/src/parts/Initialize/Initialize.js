import * as GetTypeScriptPath from '../GetTypeScriptPath/GetTypeScriptPath.js'
import * as LoadTypeScript from '../LoadTypeScript/LoadTypeScript.js'
import * as TypeScriptLanguageHost from '../TypeScriptLanguageHost/TypeScriptLanguageHost.js'

export const initialize = async () => {
  const typescriptPath = GetTypeScriptPath.getTypeScriptPath()
  const typescript = await LoadTypeScript.loadTypeScript(typescriptPath)
  console.log({ typescript })
  const languageServiceHost = TypeScriptLanguageHost.create(typescript)
  console.log({ typescript })
  // const languageService = typescript.createLanguageService(languageServiceHost, undefined, false)
  // TODO
  console.log('initialize')
}
