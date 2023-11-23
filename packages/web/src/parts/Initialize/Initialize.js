import * as GetTypeScriptPath from '../GetTypeScriptPath/GetTypeScriptPath.js'
import * as LanguageServiceState from '../LanguageServiceState/LanguageServiceState.js'
import * as LoadTypeScript from '../LoadTypeScript/LoadTypeScript.js'
import * as TypeScriptLanguageHost from '../TypeScriptLanguageHost/TypeScriptLanguageHost.js'
import * as TypeScriptServerHost from '../TypeScriptServerHost/TypeScriptServerHost.js'
import * as TypeScriptServerSession from '../TypeScriptServerSession/TypeScriptServerSession.js'
import * as TypeScriptServerSessionState from '../TypeScriptServerSessionState/TypeScriptServerSessionState.js'

export const initialize = async () => {
  const typescriptPath = GetTypeScriptPath.getTypeScriptPath()
  const typescript = await LoadTypeScript.loadTypeScript(typescriptPath)
  const languageServiceHost = TypeScriptLanguageHost.create(typescript)
  const languageService = typescript.createLanguageService(languageServiceHost, undefined, false)
  LanguageServiceState.set(languageService)
  const host = TypeScriptServerHost.create()
  const session = TypeScriptServerSession.create(typescript, host)
  TypeScriptServerSessionState.set(session)
}
