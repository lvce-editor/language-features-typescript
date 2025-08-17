import type { LanguageService, LanguageServiceHost } from 'typescript'
import * as TypeScriptLanguageHost from '../TypeScriptLanguageHost/TypeScriptLanguageHost.ts'

export const createTypeScriptLanguageService = (ts: typeof import('typescript')): LanguageService => {
  const languageServiceHost: LanguageServiceHost = TypeScriptLanguageHost.create(ts)
  const languageService = ts.createLanguageService(languageServiceHost)
  return languageService
}
