import type { LanguageService, LanguageServiceHost } from 'typescript'
import { type IFileSystem } from '../CreateFileSystem/CreateFileSystem.ts'
import { createSyncRpcClient } from '../CreateSyncRpcClient/CreateSyncRpcClient.ts'
import * as TypeScriptLanguageHost from '../TypeScriptLanguageHost/TypeScriptLanguageHost.ts'

export const createTypeScriptLanguageService = async (
  ts: typeof import('typescript'),
  fs: IFileSystem,
): Promise<LanguageService> => {
  const client = await createSyncRpcClient()
  const uri = `file:///tmp/file.txt`

  const content = client.invokeSync('SyncApi.readFileSync', uri)
  console.log({ content })
  const languageServiceHost: LanguageServiceHost = TypeScriptLanguageHost.create(ts, fs, client)
  const languageService = ts.createLanguageService(languageServiceHost)
  return languageService
}
