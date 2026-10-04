import * as CachedFileClient from '../CachedFileClient/CachedFileClient.ts'
import { createFileSystem } from '../CreateFileSystem/CreateFileSystem.ts'
import { createSyncRpcClient } from '../CreateSyncRpcClient/CreateSyncRpcClient.ts'
import { resetLanguageServices } from '../GetOrCreateLanguageService/GetOrCreateLanguageService.ts'
import { getTypeScriptPath } from '../GetTypeScriptPath/GetTypeScriptPath.ts'
import * as LanguageServices from '../LanguageServices/LanguageServices.ts'
import { loadTypeScript } from '../LoadTypeScript/LoadTypeScript.ts'
import * as ReadLibFile from '../ReadLibFile/ReadLibFile.ts'

export const initialize = async (typeScriptPath: string, crossOriginIsolated: boolean) => {
  console.info(
    'LVCE_TS_DIAGNOSTIC ' +
      JSON.stringify({
        stage: 'initialize:start',
        timeOrigin: performance.timeOrigin,
        time: performance.now(),
        worker: globalThis.location.href,
      }),
  )
  resetLanguageServices()
  LanguageServices.get(1)?.client.dispose?.()
  const tsPath = getTypeScriptPath()
  // Warm the optional cache while TypeScript loads; reads can fall back until it is ready.
  void ReadLibFile.initialize()
  const ts = await loadTypeScript(tsPath)
  console.info(
    'LVCE_TS_DIAGNOSTIC ' +
      JSON.stringify({ stage: 'typescript:loaded', timeOrigin: performance.timeOrigin, time: performance.now() }),
  )
  const fs = createFileSystem()
  const client = await createSyncRpcClient({
    crossOriginIsolated,
    maxDelay: 30_000,
    syncId: 1,
  })
  console.info(
    'LVCE_TS_DIAGNOSTIC ' +
      JSON.stringify({ stage: 'sync:ready', timeOrigin: performance.timeOrigin, time: performance.now() }),
  )
  const id = 1
  const cachedClient = await CachedFileClient.initialize(client, fs)
  console.info(
    'LVCE_TS_DIAGNOSTIC ' +
      JSON.stringify({ stage: 'cache:ready', timeOrigin: performance.timeOrigin, time: performance.now() }),
  )
  LanguageServices.set(id, fs, cachedClient, ts)
}
