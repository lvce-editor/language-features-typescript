import type { LanguageService } from 'typescript'
import type { IFileSystem } from '../IFileSystem/IFileSystem.ts'
import { createCachedSyncRpcClient } from '../CreateCachedSyncRpcClient/CreateCachedSyncRpcClient.ts'
import { createTypeScriptLanguageService } from '../CreateTypeScriptLanguageService/CreateTypeScriptLanguageService.ts'
import { getTsConfigPath } from '../GetTsconfigPath/GetTsconfigPath.ts'
import * as LanguageServices from '../LanguageServices/LanguageServices.ts'
import { parseTsconfig } from '../ParseTsconfig/ParseTsconfig.ts'
import * as PerformanceTrace from '../PerformanceTrace/PerformanceTrace.ts'
import * as RequestActivity from '../RequestActivity/RequestActivity.ts'
import { resolveTsconfig } from '../ResolveTsconfig/ResolveTsconfig.ts'

interface Project {
  readonly configPath: string
  lastUsed: number
  readonly references: Set<string>
  readonly service: LanguageService
  readonly uris: Set<string>
}

const projectConfigCache: Record<string, number> = Object.create(null)

const projectIds = { next: 1 }
const projectCache: Record<number, Project> = Object.create(null)
const projectIdCache: Record<string, number> = Object.create(null)

export const resetLanguageServices = (): void => {
  for (const project of Object.values(projectCache)) RequestActivity.retire(() => project.service.dispose())
  for (const key of Object.keys(projectCache)) delete projectCache[key]
  for (const key of Object.keys(projectIdCache)) delete projectIdCache[key]
  for (const key of Object.keys(projectConfigCache)) delete projectConfigCache[key]
  LanguageServices.resetDocumentRegistry(1)
}

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
  const { client } = LanguageServices.get(id)
  if (client.refresh?.()) {
    resetLanguageServices()
  }
  const { documentRegistry, fs, ts } = LanguageServices.get(id)
  if (uri in projectIdCache) {
    const projectId = projectIdCache[uri]
    const project = projectCache[projectId]
    project.lastUsed = performance.now()
    const languageService = project.service
    if (trace) {
      trace.languageService.cache = 'reused'
    }
    return {
      fs,
      getCacheStatistics: client.getCacheStatistics,
      languageService,
    }
  }
  const references = new Set<string>()
  const source = trace ? createTracedClient(client, trace) : client
  const tracedClient = createCachedSyncRpcClient({
    invokeSync(method, ...params) {
      if (typeof params[0] === 'string') references.add(params[0])
      return source.invokeSync(method, ...params)
    },
  })
  const exists = (uri: string) => tracedClient.invokeSync('SyncApi.exists', uri)
  const readFile = (uri: string) => tracedClient.invokeSync('SyncApi.readFileSync', uri)
  const readDir = (uri: string) => tracedClient.invokeSync('SyncApi.readDirSync', uri)
  const tsConfigPath = PerformanceTrace.measure(trace, 'configDiscovery', () => getTsConfigPath(uri, exists))
  if (tsConfigPath && tsConfigPath in projectConfigCache) {
    const projectId = projectConfigCache[tsConfigPath]
    const project = projectCache[projectId]
    project.uris.add(uri)
    projectIdCache[uri] = projectId
    project.lastUsed = performance.now()
    for (const reference of references) project.references.add(reference)
    if (trace) trace.languageService.cache = 'reused'
    return { fs, getCacheStatistics: client.getCacheStatistics, languageService: project.service }
  }
  const parsed = PerformanceTrace.measure(trace, 'configParsing', () => parseTsconfig(tsConfigPath, readFile, ts))
  const resolved = PerformanceTrace.measure(trace, 'configResolution', () =>
    resolveTsconfig(tsConfigPath, parsed, readFile, readDir, exists, ts),
  )
  const languageService = PerformanceTrace.measure(trace, 'languageServiceCreation', () =>
    createTypeScriptLanguageService(ts, fs, tracedClient, resolved, documentRegistry),
  )
  if (trace) {
    trace.languageService.configPath = tsConfigPath || undefined
    trace.languageService.fileCount = resolved.fileNames.length
  }
  const projectId = projectIds.next++
  projectCache[projectId] = {
    configPath: tsConfigPath,
    lastUsed: performance.now(),
    references,
    service: languageService,
    uris: new Set([uri, ...resolved.fileNames]),
  }
  if (tsConfigPath) projectConfigCache[tsConfigPath] = projectId
  projectIdCache[uri] = projectId
  for (const fileName of resolved.fileNames) {
    projectIdCache[fileName] = projectId
  }

  return {
    fs,
    getCacheStatistics: client.getCacheStatistics,
    languageService,
  }
}

const normalizeUri = (uri: string): string => {
  const path = uri.replaceAll('\\', '/')
  if (path.startsWith('//')) return `file:${path}`
  if (path.startsWith('/')) return `file://${path}`
  if (/^[a-zA-Z]:\//.test(path)) return `file:///${path}`
  return path
}

const releaseClosedFiles = (fs: IFileSystem, references: ReadonlyMap<string, number>): void => {
  for (const uri of fs.getScriptFileNames()) {
    if (!references.has(normalizeUri(uri))) fs.releaseFile?.(uri)
  }
}

const removeProjectUris = (id: number, uris: ReadonlySet<string>): void => {
  for (const uri of uris) {
    if (projectIdCache[uri] === id) delete projectIdCache[uri]
  }
}

export const getProjectCount = (): number => Object.keys(projectCache).length

export const getStatistics = () => ({
  documentOverrides: LanguageServices.get(1).fs.getScriptFileNames().length,
  projects: getProjectCount(),
})

export const collectIdleProjects = (
  openUris: readonly string[],
  idleMs: number,
  maxIdleProjects: number,
  now = performance.now(),
): void => {
  if (RequestActivity.isActive()) return
  // Preserve duplicate tab references and overlapping project ownership.
  const references = new Map<string, number>()
  for (const uri of openUris) {
    const key = normalizeUri(uri)
    references.set(key, (references.get(key) || 0) + 1)
  }
  const { client, fs } = LanguageServices.get(1)
  releaseClosedFiles(fs, references)
  const idle = Object.entries(projectCache)
    .filter(([, project]) => [...project.uris].every((uri) => !references.has(normalizeUri(uri))))
    .toSorted(([, left], [, right]) => right.lastUsed - left.lastUsed)
  const retiredReferences = new Set<string>()
  for (const [index, [id, project]] of idle.entries()) {
    if (now - project.lastUsed < idleMs || index < maxIdleProjects) continue
    for (const uri of project.references) retiredReferences.add(uri)
    project.service.dispose()
    delete projectCache[Number(id)]
    delete projectConfigCache[project.configPath]
    removeProjectUris(Number(id), project.uris)
  }
  for (const project of Object.values(projectCache)) {
    for (const uri of project.references) retiredReferences.delete(uri)
  }
  client.forgetReferences?.([...retiredReferences])
  // Keep the OPFS journals alive, but release their in-memory source identities.
  if (!getProjectCount()) client.clearReferences?.()
}
