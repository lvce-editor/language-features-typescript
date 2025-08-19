import type { LanguageService, LanguageServiceHost } from 'typescript'
import { createSyncRpcClient } from '../CreateSyncRpcClient/CreateSyncRpcClient.ts'
import { type IFileSystem } from '../IFileSystem/IFileSystem.ts'
import * as TypeScriptLanguageHost from '../TypeScriptLanguageHost/TypeScriptLanguageHost.ts'

export const createTypeScriptLanguageService = async (
  ts: typeof import('typescript'),
  fs: IFileSystem,
): Promise<LanguageService> => {
  const client = await createSyncRpcClient()
  const languageServiceHost: LanguageServiceHost = TypeScriptLanguageHost.create(ts, fs, client)
  const languageService = ts.createLanguageService(languageServiceHost)
  return languageService
}
