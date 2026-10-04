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
  const fs = createFileSystem()
  const clientReady = createSyncRpcClient({
    crossOriginIsolated,
    maxDelay: 30_000,
    syncId: 1,
  })
  // Open the independent source journals while the TypeScript module loads.
  // Serializing these operations delays the first diagnostics on cold startup.
  const cachedClientReady = clientReady.then((client) => CachedFileClient.initialize(client, fs))
  const [ts, cachedClient] = await Promise.all([loadTypeScript(tsPath), cachedClientReady])
  const id = 1
  LanguageServices.set(id, fs, cachedClient, ts)
}
