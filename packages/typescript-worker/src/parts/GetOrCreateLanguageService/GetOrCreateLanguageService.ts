import type { LanguageService } from 'typescript'
import { createTypeScriptLanguageService } from '../CreateTypeScriptLanguageService/CreateTypeScriptLanguageService.ts'
import { getTsConfigPath } from '../GetTsconfigPath/GetTsconfigPath.ts'
import * as LanguageServices from '../LanguageServices/LanguageServices.ts'
import { parseTsconfig } from '../ParseTsconfig/ParseTsconfig.ts'
import { resolveTsconfig } from '../ResolveTsconfig/ResolveTsconfig.ts'

let nextProjectId = 1
const projectCache: Record<number, LanguageService> = Object.create(null)
const projectIdCache: Record<string, number> = Object.create(null)

export const getOrCreateLanguageService = (uri: string) => {
  const id = 1
  const { fs, ts, client } = LanguageServices.get(id)
  if (uri in projectCache) {
    const projectId = projectIdCache[uri]
    const languageService = projectCache[projectId]
    return {
      fs,
      languageService,
    }
  }
  const exists = (uri: string) => client.invokeSync('SyncApi.exists', uri)
  const readFile = (uri: string) => client.invokeSync('SyncApi.readFileSync', uri)
  const readDir = (uri: string) => client.invokeSync('SyncApi.readDirSync', uri)
  const tsConfigPath = getTsConfigPath(uri, exists)
  const parsed = parseTsconfig(tsConfigPath, readFile)
  const resolved = resolveTsconfig(tsConfigPath, parsed, readFile, readDir, exists, ts)
  const languageService = createTypeScriptLanguageService(ts, fs, client, resolved)
  const projectId = nextProjectId++
  projectCache[projectId] = languageService
  projectIdCache[uri] = projectId

  return {
    fs,
    languageService,
  }
}
