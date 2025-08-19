import type { LanguageService, LanguageServiceHost } from 'typescript'
import type { IFileSystem } from '../IFileSystem/IFileSystem.ts'
import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'
import * as TypeScriptLanguageHost from '../TypeScriptLanguageHost/TypeScriptLanguageHost.ts'

export const createTypeScriptLanguageService = (
  ts: typeof import('typescript'),
  fs: IFileSystem,
  client: SyncRpc,
): LanguageService => {
  const languageServiceHost: LanguageServiceHost = TypeScriptLanguageHost.create(ts, fs, client)
  const languageService = ts.createLanguageService(languageServiceHost)
  return languageService
}
