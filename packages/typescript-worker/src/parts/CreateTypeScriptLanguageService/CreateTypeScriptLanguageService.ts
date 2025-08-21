import type { LanguageService, LanguageServiceHost, ParsedCommandLine } from 'typescript'
import type { IFileSystem } from '../IFileSystem/IFileSystem.ts'
import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'
import * as TypeScriptLanguageHost from '../TypeScriptLanguageHost/TypeScriptLanguageHost.ts'

export const createTypeScriptLanguageService = (
  ts: typeof import('typescript'),
  fs: IFileSystem,
  client: SyncRpc,
  config: ParsedCommandLine,
): LanguageService => {
  const languageServiceHost: LanguageServiceHost = TypeScriptLanguageHost.create(ts, fs, client, config)
  const languageService = ts.createLanguageService(languageServiceHost)
  return languageService
}
