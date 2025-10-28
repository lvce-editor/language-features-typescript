import { createFileSystem } from '../CreateFileSystem/CreateFileSystem.ts'
import { createSyncRpcClient } from '../CreateSyncRpcClient/CreateSyncRpcClient.ts'
import { getTypeScriptPath } from '../GetTypeScriptPath/GetTypeScriptPath.ts'
import * as LanguageServices from '../LanguageServices/LanguageServices.ts'
import { loadTypeScript } from '../LoadTypeScript/LoadTypeScript.ts'

export const initialize = async (typeScriptPath: string, crossOriginIsolated: boolean) => {
  const tsPath = getTypeScriptPath()
  const ts = await loadTypeScript(tsPath)
  const fs = createFileSystem()
  const client = await createSyncRpcClient({
    crossOriginIsolated,
    maxDelay: 30_000,
    syncId: 1,
  })
  const id = 1
  LanguageServices.set(id, fs, client, ts)
}
