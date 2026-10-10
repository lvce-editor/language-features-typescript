import type { LanguageService, ParsedCommandLine } from 'typescript'
import type { IFileSystem } from '../IFileSystem/IFileSystem.ts'
import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'
import { createCachedSyncRpcClient } from '../CreateCachedSyncRpcClient/CreateCachedSyncRpcClient.ts'
import { createTypeScriptLanguageService } from '../CreateTypeScriptLanguageService/CreateTypeScriptLanguageService.ts'
import { getParentPath } from '../GetParentPath/GetParentPath.ts'
import { getTsConfigPath } from '../GetTsconfigPath/GetTsconfigPath.ts'
import * as LanguageServices from '../LanguageServices/LanguageServices.ts'
import { parseTsconfig } from '../ParseTsconfig/ParseTsconfig.ts'
import * as PerformanceTrace from '../PerformanceTrace/PerformanceTrace.ts'
import * as RequestActivity from '../RequestActivity/RequestActivity.ts'
import { resolveTsconfig } from '../ResolveTsconfig/ResolveTsconfig.ts'

interface Project {
  readonly configuredRoots: ReadonlySet<string>
  readonly configVersions: ReadonlyMap<string, string>
  readonly key: string
  lastUsed: number
  readonly references: Set<string>
  readonly service: LanguageService
  readonly uris: Set<string>
}

const projectConfigCache: Record<string, number> = Object.create(null)

const projectIds = { next: 1 }
const projectCache: Record<number, Project> = Object.create(null)

export const resetLanguageServices = (): void => {
  for (const project of Object.values(projectCache)) RequestActivity.retire(() => project.service.dispose())
  for (const key of Object.keys(projectCache)) delete projectCache[key]
  for (const key of Object.keys(projectConfigCache)) delete projectConfigCache[key]
}

const documentVersion = (fs: IFileSystem, uri: string): string =>
  fs.readFile(uri) === undefined ? 'disk' : fs.getScriptVersion(uri)

const retireProject = (id: number, project: Project): void => {
  RequestActivity.retire(() => project.service.dispose())
  delete projectCache[id]
  delete projectConfigCache[project.key]
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

const refreshProjects = (client: SyncRpc, fs: IFileSystem): void => {
  if (client.refresh?.()) {
    const changed = client.getChangedFiles?.()
    if (changed) {
      const paths = new Set(changed.map(normalizeUri))
      for (const [id, project] of Object.entries(projectCache)) {
        if ([...project.references].some((reference) => paths.has(normalizeUri(reference)))) {
          retireProject(Number(id), project)
        }
      }
    } else {
      resetLanguageServices()
    }
  }
  for (const [id, project] of Object.entries(projectCache)) {
    if ([...project.configVersions].some(([path, version]) => documentVersion(fs, path) !== version)) {
      retireProject(Number(id), project)
    }
  }
}

const getProjectKey = (uri: string, tsConfigPath: string, client: SyncRpc): string => {
  if (tsConfigPath) return normalizeUri(tsConfigPath)
  let inferredRoot = getParentPath(uri)
  try {
    const workspace = client.invokeSync('SyncApi.getWorkspaceUri')
    if (
      typeof workspace === 'string' &&
      normalizeUri(uri).startsWith(`${normalizeUri(workspace).replace(/\/$/, '')}/`)
    ) {
      inferredRoot = workspace
    }
  } catch {
    // Standalone transports without workspace metadata use directory identity.
  }
  return `inferred:${normalizeUri(inferredRoot)}`
}

export const getOrCreateLanguageService = (uri: string, trace?: PerformanceTrace.MutablePerformanceTrace) => {
  const id = 1
  const { client, fs, ts } = LanguageServices.get(id)
  refreshProjects(client, fs)
  const references = new Set<string>()
  const configFiles = new Set<string>()
  const source = trace ? createTracedClient(client, trace) : client
  const tracedClient = createCachedSyncRpcClient({
    invokeSync(method, ...params) {
      if (typeof params[0] === 'string') {
        references.add(params[0])
        if (method === 'SyncApi.readFileSync' || params[0].endsWith('/tsconfig.json')) configFiles.add(params[0])
      }
      if (method === 'SyncApi.exists' && fs.readFile(params[0]) !== undefined) return true
      if (method === 'SyncApi.readFileSync') {
        const live = fs.readFile(params[0])
        if (live !== undefined) return live
      }
      return source.invokeSync(method, ...params)
    },
  })
  const exists = (uri: string) => tracedClient.invokeSync('SyncApi.exists', uri)
  const readFile = (uri: string) => tracedClient.invokeSync('SyncApi.readFileSync', uri)
  const readDir = (uri: string) => tracedClient.invokeSync('SyncApi.readDirSync', uri)
  let tsConfigPath = PerformanceTrace.measure(trace, 'configDiscovery', () => getTsConfigPath(uri, exists))
  let javascriptConfig: ParsedCommandLine | undefined
  if (tsConfigPath && /\.(?:[cm]?js|jsx)$/i.test(uri)) {
    const parsed = parseTsconfig(tsConfigPath, readFile, ts)
    javascriptConfig = resolveTsconfig(tsConfigPath, parsed, readFile, readDir, exists, ts)
    // A config that disallows JS cannot supply that document's program. Keep its
    // options intact and serve the document from the inferred workspace instead.
    if (!javascriptConfig.options.allowJs) {
      tsConfigPath = ''
      javascriptConfig = undefined
    }
  }
  const key = getProjectKey(uri, tsConfigPath, tracedClient)
  if (key in projectConfigCache) {
    const projectId = projectConfigCache[key]
    const project = projectCache[projectId]
    project.uris.add(uri)
    project.lastUsed = performance.now()
    for (const reference of references) project.references.add(reference)
    if (trace) trace.languageService.cache = 'reused'
    return { fs, getCacheStatistics: client.getCacheStatistics, languageService: project.service }
  }
  const parsed = PerformanceTrace.measure(trace, 'configParsing', () => parseTsconfig(tsConfigPath, readFile, ts))
  const resolved =
    javascriptConfig ||
    PerformanceTrace.measure(trace, 'configResolution', () =>
      resolveTsconfig(tsConfigPath, parsed, readFile, readDir, exists, ts),
    )
  const configVersions = new Map(Array.from(configFiles, (path) => [path, documentVersion(fs, path)]))
  const uris = new Set([...resolved.fileNames, uri])
  const languageService = PerformanceTrace.measure(trace, 'languageServiceCreation', () =>
    createTypeScriptLanguageService(ts, fs, tracedClient, resolved, uris, references),
  )
  if (trace) {
    trace.languageService.configPath = tsConfigPath || undefined
    trace.languageService.fileCount = resolved.fileNames.length
  }
  const projectId = projectIds.next++
  projectCache[projectId] = {
    configuredRoots: new Set(resolved.fileNames),
    configVersions,
    key,
    lastUsed: performance.now(),
    references,
    service: languageService,
    uris,
  }
  projectConfigCache[key] = projectId

  return {
    fs,
    getCacheStatistics: client.getCacheStatistics,
    languageService,
  }
}

const normalizeUri = (uri: string): string => {
  let path = uri.replaceAll('\\', '/')
  if (path.startsWith('//')) path = `file:${path}`
  else if (path.startsWith('/')) path = `file://${path}`
  else if (/^[a-zA-Z]:\//.test(path)) path = `file:///${path}`
  return path.includes('://') ? new URL(path).href : path
}

const releaseClosedFiles = (fs: IFileSystem, references: ReadonlyMap<string, number>): void => {
  for (const uri of fs.getScriptFileNames()) {
    if (!references.has(normalizeUri(uri))) fs.releaseFile?.(uri)
  }
  for (const project of Object.values(projectCache)) {
    for (const uri of project.uris) {
      if (!project.configuredRoots.has(uri) && !references.has(normalizeUri(uri)) && fs.readFile(uri) === undefined) {
        project.uris.delete(uri)
      }
    }
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
    delete projectConfigCache[project.key]
  }
  for (const project of Object.values(projectCache)) {
    for (const uri of project.references) retiredReferences.delete(uri)
  }
  client.forgetReferences?.([...retiredReferences])
  // Keep the OPFS journals alive, but release their in-memory source identities.
  if (!getProjectCount()) client.clearReferences?.()
}
