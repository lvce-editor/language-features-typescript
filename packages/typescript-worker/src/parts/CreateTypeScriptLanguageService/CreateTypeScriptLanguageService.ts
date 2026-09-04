import type * as TypeScript from 'typescript'
import type { IFileSystem } from '../IFileSystem/IFileSystem.ts'
import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'
import * as TypeScriptLanguageHost from '../TypeScriptLanguageHost/TypeScriptLanguageHost.ts'

export const createTypeScriptLanguageService = (
  ts: typeof TypeScript,
  fs: IFileSystem,
  client: SyncRpc,
  config: TypeScript.ParsedCommandLine,
): TypeScript.LanguageService => {
  const languageServiceHost: TypeScript.LanguageServiceHost = TypeScriptLanguageHost.create(ts, fs, client, config)
  const languageService = ts.createLanguageService(languageServiceHost)
  return languageService
}
