import { createFileSystem } from '../CreateFileSystem/CreateFileSystem.ts'
import { createSyncRpcClient } from '../CreateSyncRpcClient/CreateSyncRpcClient.ts'
import { getTypeScriptPath } from '../GetTypeScriptPath/GetTypeScriptPath.ts'
import * as LanguageServices from '../LanguageServices/LanguageServices.ts'
import { loadTypeScript } from '../LoadTypeScript/LoadTypeScript.ts'

export const initialize = async (path: string) => {
  const tsPath = getTypeScriptPath()
  const ts = await loadTypeScript(tsPath)
  const fs = createFileSystem()
  const client = await createSyncRpcClient()
  const id = 1
  LanguageServices.set(id, fs, client, ts)
}
