import * as CachedFileClient from '../CachedFileClient/CachedFileClient.ts'
import { createFileSystem } from '../CreateFileSystem/CreateFileSystem.ts'
import { createSyncRpcClient } from '../CreateSyncRpcClient/CreateSyncRpcClient.ts'
import { resetLanguageServices } from '../GetOrCreateLanguageService/GetOrCreateLanguageService.ts'
import { getTypeScriptPath } from '../GetTypeScriptPath/GetTypeScriptPath.ts'
import * as LanguageServices from '../LanguageServices/LanguageServices.ts'
import { loadTypeScript } from '../LoadTypeScript/LoadTypeScript.ts'
import * as ReadLibFile from '../ReadLibFile/ReadLibFile.ts'

export const initialize = async (typeScriptPath: string, crossOriginIsolated: boolean) => {
  resetLanguageServices()
  LanguageServices.get(1)?.client.dispose?.()
  const tsPath = getTypeScriptPath()
  // Warm the optional cache while TypeScript loads; reads can fall back until it is ready.
  void ReadLibFile.initialize()
  const ts = await loadTypeScript(tsPath)
  const fs = createFileSystem()
  const client = await createSyncRpcClient({
    crossOriginIsolated,
    maxDelay: 30_000,
    syncId: 1,
  })
  const id = 1
  const cachedClient = await CachedFileClient.initialize(client, fs)
  LanguageServices.set(id, fs, cachedClient, ts)
}
