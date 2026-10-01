import { createFileSystem } from '../CreateFileSystem/CreateFileSystem.ts'
import { createSyncRpcClient } from '../CreateSyncRpcClient/CreateSyncRpcClient.ts'
import { getTypeScriptPath } from '../GetTypeScriptPath/GetTypeScriptPath.ts'
import * as LanguageServices from '../LanguageServices/LanguageServices.ts'
import { loadTypeScript } from '../LoadTypeScript/LoadTypeScript.ts'
import * as ReadLibFile from '../ReadLibFile/ReadLibFile.ts'

export const initialize = async (typeScriptPath: string, crossOriginIsolated: boolean) => {
  const tsPath = getTypeScriptPath()
  const ts = await loadTypeScript(tsPath)
  // Library reads use the synchronous fallback until the optional cache is ready.
  void ReadLibFile.initialize()
  const fs = createFileSystem()
  const client = await createSyncRpcClient({
    crossOriginIsolated,
    maxDelay: 30_000,
    syncId: 1,
  })
  const id = 1
  LanguageServices.set(id, fs, client, ts)
}
