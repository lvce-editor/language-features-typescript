import type { LanguageService } from 'typescript'
import { createTypeScriptLanguageService } from '../CreateTypeScriptLanguageService/CreateTypeScriptLanguageService.ts'
import { getTsConfigPath } from '../GetTsconfigPath/GetTsconfigPath.ts'
import * as LanguageServices from '../LanguageServices/LanguageServices.ts'
import { parseTsconfig } from '../ParseTsconfig/ParseTsconfig.ts'
import * as PerformanceTrace from '../PerformanceTrace/PerformanceTrace.ts'
import { resolveTsconfig } from '../ResolveTsconfig/ResolveTsconfig.ts'

const projectIds = { next: 1 }
const projectCache: Record<number, LanguageService> = Object.create(null)
const projectIdCache: Record<string, number> = Object.create(null)

const createTracedClient = (
  client: ReturnType<typeof LanguageServices.get>['client'],
  trace: PerformanceTrace.MutablePerformanceTrace,
) => ({
  invokeSync(method: string, ...params: readonly any[]) {
    const start = performance.now()
    try {
      return client.invokeSync(method, ...params)
    } finally {
      PerformanceTrace.recordSyncRpc(trace, method, performance.now() - start)
    }
  },
})

export const getOrCreateLanguageService = (uri: string, trace?: PerformanceTrace.MutablePerformanceTrace) => {
  const id = 1
  const { client, fs, ts } = LanguageServices.get(id)
  if (uri in projectIdCache) {
    const projectId = projectIdCache[uri]
    const languageService = projectCache[projectId]
    if (trace) {
      trace.languageService.cache = 'reused'
    }
    return {
      fs,
      languageService,
    }
  }
  const tracedClient = trace ? createTracedClient(client, trace) : client
  const exists = (uri: string) => tracedClient.invokeSync('SyncApi.exists', uri)
  const readFile = (uri: string) => tracedClient.invokeSync('SyncApi.readFileSync', uri)
  const readDir = (uri: string) => tracedClient.invokeSync('SyncApi.readDirSync', uri)
  const tsConfigPath = PerformanceTrace.measure(trace, 'configDiscovery', () => getTsConfigPath(uri, exists))
  const parsed = PerformanceTrace.measure(trace, 'configParsing', () => parseTsconfig(tsConfigPath, readFile, ts))
  const resolved = PerformanceTrace.measure(trace, 'configResolution', () =>
    resolveTsconfig(tsConfigPath, parsed, readFile, readDir, exists, ts),
  )
  const languageService = PerformanceTrace.measure(trace, 'languageServiceCreation', () =>
    createTypeScriptLanguageService(ts, fs, tracedClient, resolved),
  )
  if (trace) {
    trace.languageService.configPath = tsConfigPath || undefined
    trace.languageService.fileCount = resolved.fileNames.length
  }
  const projectId = projectIds.next++
  projectCache[projectId] = languageService
  projectIdCache[uri] = projectId
  for (const fileName of resolved.fileNames) {
    projectIdCache[fileName] = projectId
  }

  return {
    fs,
    languageService,
  }
}
