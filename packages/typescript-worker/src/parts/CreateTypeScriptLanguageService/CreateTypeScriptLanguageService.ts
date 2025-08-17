import type { LanguageService, LanguageServiceHost } from 'typescript'
import { type IFileSystem } from '../CreateFileSystem/CreateFileSystem.ts'
import * as TypeScriptLanguageHost from '../TypeScriptLanguageHost/TypeScriptLanguageHost.ts'

export const createTypeScriptLanguageService = (ts: typeof import('typescript'), fs: IFileSystem): LanguageService => {
  const languageServiceHost: LanguageServiceHost = TypeScriptLanguageHost.create(ts, fs)
  const languageService = ts.createLanguageService(languageServiceHost)
  return languageService
}
