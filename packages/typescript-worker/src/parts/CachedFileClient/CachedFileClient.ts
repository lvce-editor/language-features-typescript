import type { FileContentCache, SyncHandle } from '../FileContentCache/FileContentCache.ts'
import type { FileMetadataCache } from '../FileMetadataCache/FileMetadataCache.ts'
import type { IFileSystem } from '../IFileSystem/IFileSystem.ts'
import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'
import { createFileContentCache } from '../FileContentCache/FileContentCache.ts'
import { createFileMetadataCache } from '../FileMetadataCache/FileMetadataCache.ts'
import { createWatchClient, type WatchDescriptor } from '../FileWatchClient/FileWatchClient.ts'
import * as Rpc from '../Rpc/Rpc.ts'

interface CacheFileHandle {
  createSyncAccessHandle(): Promise<SyncHandle>
}

interface DependencyGeneration {
  directories: Record<string, string[]>
  exists: Record<string, boolean>
  hashes: Record<string, string>
  lockHash: string
}

const openHandle = async (name: string): Promise<SyncHandle | undefined> => {
  try {
    const file: CacheFileHandle = await Rpc.invoke('FileCache.getHandle', name)
    return await file.createSyncAccessHandle()
  } catch {
    // Another worker may own the exclusive lock, or OPFS may be unavailable.
    return undefined
  }
}

const open = async (name: string): Promise<FileContentCache | undefined> => {
  const handle = await openHandle(name)
  return handle ? createFileContentCache(handle) : undefined
}

const directoryIdentity = (value: readonly string[]): string =>
  JSON.stringify(value.toSorted((a, b) => a.localeCompare(b)))

export const createCachedClient = (
  client: SyncRpc,
  fs: IFileSystem,
  general: FileContentCache | undefined,
  dependencies: FileContentCache | undefined,
  metadata: FileMetadataCache | undefined = undefined,
  cacheNodeModules = true,
): SyncRpc => {
  const identities = new Map<string, string | null | undefined>()
  const directories = new Map<string, string>()
  const missing = new Set<string>()
  const resolutionRoots = new Map<string, string>()
  const dependencyGenerations = new Map<string, DependencyGeneration>()
  const dependencyLocks = new Map<string, string | null>()
  let disposed = false
  let changedFiles: readonly string[] | undefined = []
  const statistics = {
    dependenciesEnabled: !!dependencies,
    dependencyHits: 0,
    generalEnabled: !!general,
    generalHits: 0,
    identitiesChecked: 0,
    identityRequests: 0,
    sourceReads: 0,
  }
  const getHashes = (uris: readonly string[]): readonly (string | null)[] => {
    statistics.identityRequests++
    statistics.identitiesChecked += uris.length
    const result = client.invokeSync('FileCache.getHashes', uris)
    if (!Array.isArray(result) || result.length !== uris.length) throw new Error('Invalid file identities')
    return result.map((hash) => (typeof hash === 'string' && /^[a-f0-9]{64}$/.test(hash) ? hash : null))
  }
  const dependencyRoot = (uri: string): string | undefined => {
    const marker = '/node_modules/'
    const index = uri.lastIndexOf(marker)
    if (index === -1) return undefined
    return uri.slice(0, index)
  }
  const dependencyRootForPath = (uri: string): string | undefined => {
    return dependencyRoot(uri) ?? (uri.endsWith('/node_modules') ? uri.slice(0, -'/node_modules'.length) : undefined)
  }
  const isTrustedDependencyPath = (uri: string): boolean => {
    const root = dependencyRootForPath(uri)
    return root !== undefined && !!getDependencyLockHash(root) && !!dependencyGenerations.get(root)
  }
  const loadDependencyGeneration = (root: string, hash: string): DependencyGeneration => {
    if (client.isWatchedPath?.(`${root}/node_modules`))
      return { directories: {}, exists: {}, hashes: {}, lockHash: hash }
    try {
      const saved = JSON.parse(metadata?.get(root) || 'null')
      if (saved?.lockHash !== hash || !saved?.hashes || typeof saved.hashes !== 'object') {
        return { directories: {}, exists: {}, hashes: {}, lockHash: hash }
      }
      const directories = Object.fromEntries(
        Object.entries(saved.directories || {}).filter(
          ([, value]) => Array.isArray(value) && value.every((entry) => typeof entry === 'string'),
        ),
      ) as Record<string, string[]>
      const exists = Object.fromEntries(
        Object.entries(saved.exists || {}).filter(([, value]) => typeof value === 'boolean'),
      ) as Record<string, boolean>
      const hashes = Object.fromEntries(
        Object.entries(saved.hashes).filter(([, value]) => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value)),
      ) as Record<string, string>
      return {
        directories,
        exists,
        hashes,
        lockHash: hash,
      }
    } catch {
      return { directories: {}, exists: {}, hashes: {}, lockHash: hash }
    }
  }
  const getDependencyLockHash = (root: string): string | null => {
    if (!root.startsWith('file://') || (client.isWatchedPath && !client.isWatchedPath(`${root}/node_modules`)))
      return null
    if (dependencyLocks.has(root)) return dependencyLocks.get(root) ?? null
    let hash: string | null = null
    try {
      hash = getHashes([`${root}/node_modules/.package-lock.json`])[0]
    } catch {
      // A missing, unreadable or unsupported lockfile keeps per-file validation.
    }
    dependencyLocks.set(root, hash)
    if (hash) {
      const generation = loadDependencyGeneration(root, hash)
      dependencyGenerations.set(root, generation)
      metadata?.set(root, JSON.stringify(generation))
    }
    return hash
  }
  const refreshDependencyLockHash = (root: string): string | null => {
    if (!root.startsWith('file://') || (client.isWatchedPath && !client.isWatchedPath(`${root}/node_modules`)))
      return null
    let hash: string | null = null
    try {
      hash = getHashes([`${root}/node_modules/.package-lock.json`])[0]
    } catch {
      // Keep conservative per-file validation when lockfile identity is unavailable.
    }
    const previousHash = dependencyLocks.get(root)
    dependencyLocks.set(root, hash)
    if (hash !== previousHash) {
      const previous = dependencyGenerations.get(root)
      if (previous) for (const uri of Object.keys(previous.hashes)) identities.set(uri, undefined)
      dependencyGenerations.delete(root)
      if (hash) {
        const generation = { directories: {}, exists: {}, hashes: {}, lockHash: hash }
        dependencyGenerations.set(root, generation)
        metadata?.set(root, JSON.stringify(generation))
      }
    }
    return hash
  }
  const persistDependencyHash = (root: string, uri: string, hash: string): void => {
    const generation = dependencyGenerations.get(root)
    if (!generation) return
    generation.hashes[uri] = hash
    try {
      metadata?.set(root, JSON.stringify(generation))
    } catch {
      // Persistent mappings are an optional optimization.
    }
  }
  const persistDependencyResolution = (root: string, uri: string, value: string[] | boolean): void => {
    const generation = dependencyGenerations.get(root)
    if (!generation) return
    if (typeof value === 'boolean') generation.exists[uri] = value
    else generation.directories[uri] = value
    metadata?.set(root, JSON.stringify(generation))
  }
  const getCachedResolution = (method: string, uri: string, root: string | undefined): any => {
    if (!root) return undefined
    const generation = getDependencyLockHash(root) ? dependencyGenerations.get(root) : undefined
    if (!generation) return undefined
    if (method === 'SyncApi.readDirSync' && uri in generation.directories) {
      const entries = [...generation.directories[uri]]
      directories.set(uri, directoryIdentity(entries))
      return entries
    }
    if (method === 'SyncApi.exists' && uri in generation.exists) {
      const exists = generation.exists[uri]
      if (!exists) missing.add(uri)
      return exists
    }
    return undefined
  }
  const recordObservedResolution = (method: string, uri: unknown, value: any): void => {
    if (typeof uri !== 'string') return
    if (method === 'SyncApi.exists' && !value) missing.add(uri)
    if (method === 'SyncApi.readDirSync') directories.set(uri, directoryIdentity(value))
  }
  const storeResolution = (
    method: string,
    uri: unknown,
    root: string | undefined,
    lockHash: string | null,
    value: unknown,
  ): void => {
    if (!root || !lockHash || typeof uri !== 'string') return
    if (method === 'SyncApi.readDirSync' && Array.isArray(value) && value.every((entry) => typeof entry === 'string')) {
      persistDependencyResolution(root, uri, value)
    }
    if (method === 'SyncApi.exists') persistDependencyResolution(root, uri, !!value)
  }
  const invokeFileSystem = (method: string, params: readonly any[], uri: unknown): any => {
    const root = cacheNodeModules && typeof uri === 'string' ? dependencyRootForPath(uri) : undefined
    const lockHash = root ? getDependencyLockHash(root) : null
    if (root && lockHash && typeof uri === 'string') resolutionRoots.set(uri, root)
    if (typeof uri === 'string') {
      const cached = getCachedResolution(method, uri, root)
      if (cached !== undefined) return cached
    }
    const value = client.invokeSync(method, ...params)
    recordObservedResolution(method, uri, value)
    storeResolution(method, uri, root, lockHash, value)
    return value
  }
  const getDependencyCacheHit = (uri: string, root: string | undefined): string | undefined => {
    if (root === undefined) return undefined
    const lockHash = getDependencyLockHash(root)
    const hash = lockHash ? dependencyGenerations.get(root)?.hashes[uri] : undefined
    if (!hash) return undefined
    identities.set(uri, hash)
    const content = dependencies?.get(hash)
    if (content !== undefined) statistics.dependencyHits++
    return content
  }
  const getFileHash = (uri: string): string | null => {
    try {
      return getHashes([uri])[0]
    } catch {
      // Source reads remain available when the optional hashing API fails.
      return null
    }
  }
  const getCachedFileContent = (hash: string | null, cache: FileContentCache | undefined): string | undefined => {
    if (!hash) return undefined
    const content = cache?.get(hash)
    if (content === undefined) return undefined
    if (cache === dependencies) statistics.dependencyHits++
    else statistics.generalHits++
    return content
  }
  const readFile = (uri: string) => {
    const live = fs.readFile(uri)
    if (live !== undefined) return live
    const root = cacheNodeModules ? dependencyRoot(uri) : undefined
    const isDependency = root !== undefined
    const cache = isDependency ? dependencies : general
    const dependencyContent = getDependencyCacheHit(uri, root)
    if (dependencyContent !== undefined) return dependencyContent
    const hash = getFileHash(uri)
    identities.set(uri, hash)
    if (root !== undefined && hash) persistDependencyHash(root, uri, hash)
    const cached = getCachedFileContent(hash, cache)
    if (cached !== undefined) return cached
    statistics.sourceReads++
    const content = client.invokeSync('SyncApi.readFileSync', uri)
    // A readable file without a trustworthy identity cannot retain a program snapshot.
    if (!hash) identities.set(uri, undefined)
    if (hash && typeof content === 'string') cache?.set(hash, content)
    return content
  }
  const getUrisToValidate = (uris: readonly string[]): string[] => {
    const validateUris: string[] = []
    for (const uri of uris) {
      if (client.isWatchedPath?.(uri)) continue
      const root = cacheNodeModules ? dependencyRoot(uri) : undefined
      if (root === undefined) {
        validateUris.push(uri)
        continue
      }
      const lockHash = dependencyLocks.get(root)
      if (!lockHash || !dependencyGenerations.get(root)?.hashes[uri]) validateUris.push(uri)
    }
    return validateUris
  }
  const getChangedIdentities = (uris: readonly string[]): Set<string> => {
    const hashes = uris.length > 0 ? getHashes(uris) : []
    const changed = new Set<string>()
    for (const [index, hash] of hashes.entries()) {
      const uri = uris[index]
      if (hash !== identities.get(uri)) changed.add(uri)
      if (identities.get(uri) !== undefined) identities.set(uri, hash)
    }
    return changed
  }
  const addDependencyRoots = (
    roots: Set<string>,
    uris: Iterable<string>,
    getRoot: (uri: string) => string | undefined,
  ): void => {
    for (const uri of uris) {
      const root = cacheNodeModules ? getRoot(uri) : undefined
      if (root !== undefined) roots.add(root)
    }
  }
  const getTrackedDependencyRoots = (uris: readonly string[]): Set<string> => {
    const roots = new Set<string>()
    addDependencyRoots(roots, uris, dependencyRoot)
    addDependencyRoots(roots, directories.keys(), dependencyRootForPath)
    addDependencyRoots(roots, missing, dependencyRootForPath)
    for (const root of resolutionRoots.values()) roots.add(root)
    return roots
  }
  const refreshDependencyRoots = (roots: ReadonlySet<string>): Set<string> => {
    const changedRoots = new Set<string>()
    for (const root of roots) {
      if (client.isWatchedPath?.(`${root}/node_modules`)) continue
      const previousHash = dependencyLocks.get(root)
      const hadPreviousHash = dependencyLocks.has(root)
      const lockHash = refreshDependencyLockHash(root)
      if (hadPreviousHash && previousHash !== lockHash) changedRoots.add(root)
    }
    return changedRoots
  }
  const refreshFileIdentities = (): { changed: Set<string>; changedRoots: Set<string> } => {
    const uris = identities
      .keys()
      .filter((uri) => fs.readFile(uri) === undefined)
      .toArray()
    const changedRoots = refreshDependencyRoots(getTrackedDependencyRoots(uris))
    const validateUris = getUrisToValidate(uris)
    const changed = getChangedIdentities(validateUris)
    if (changedRoots.size > 0) {
      for (const uri of [...uris, ...directories.keys(), ...missing, ...resolutionRoots.keys()]) {
        if (changedRoots.has(dependencyRootForPath(uri) ?? '')) changed.add(uri)
      }
    }
    return { changed, changedRoots }
  }
  const refreshResolution = (changed: Set<string>, changedRoots: Set<string>): void => {
    const shouldValidate = (uri: string): boolean => {
      if (client.isWatchedPath?.(uri)) return false
      const root = dependencyRootForPath(uri)
      return !cacheNodeModules || !isTrustedDependencyPath(uri) || changedRoots.has(root!)
    }
    const directoryUris = directories.keys().filter(shouldValidate).toArray()
    const missingUris = missing.values().filter(shouldValidate).toArray()
    if (directoryUris.length === 0 && missingUris.length === 0) return
    const state = client.invokeSync('FileCache.getValidation', directoryUris, missingUris)
    if (
      !state ||
      !Array.isArray(state.entries) ||
      state.entries.length !== directoryUris.length ||
      state.entries.some(
        (entries: unknown) => !(Array.isArray(entries) && entries.every((entry: unknown) => typeof entry === 'string')),
      ) ||
      !Array.isArray(state.available) ||
      state.available.length !== missingUris.length ||
      state.available.some((entry: unknown) => typeof entry !== 'boolean')
    )
      throw new Error('Invalid resolution validation')
    for (const [index, uri] of directoryUris.entries()) {
      const value = state.entries[index]
      const identity = directoryIdentity(value)
      if (identity !== directories.get(uri)) changed.add(uri)
      directories.set(uri, identity)
      const root = dependencyRootForPath(uri)
      if (root && dependencyLocks.get(root)) persistDependencyResolution(root, uri, value)
    }
    for (const [index, uri] of missingUris.entries()) {
      const exists = state.available[index]
      const root = dependencyRootForPath(uri)
      if (root && dependencyLocks.get(root)) persistDependencyResolution(root, uri, exists)
      if (!exists) continue
      changed.add(uri)
      missing.delete(uri)
    }
  }
  return {
    clearReferences() {
      client.clearReferences?.()
      identities.clear()
      directories.clear()
      missing.clear()
      resolutionRoots.clear()
    },
    dispose() {
      if (disposed) return
      disposed = true
      client.dispose?.()
      general?.close()
      dependencies?.close()
      metadata?.close()
      identities.clear()
      directories.clear()
      missing.clear()
      resolutionRoots.clear()
    },
    forgetReferences(uris) {
      client.forgetReferences?.(uris)
      for (const uri of uris) {
        identities.delete(uri)
        directories.delete(uri)
        missing.delete(uri)
        resolutionRoots.delete(uri)
      }
    },
    getCacheStatistics: () => ({
      ...statistics,
      ...(client.getTransportStatistics && { transport: client.getTransportStatistics() }),
    }),
    getChangedFiles: () => changedFiles,
    invokeSync(method, ...params) {
      if (disposed) return client.invokeSync(method, ...params)
      const uri = params[0]
      if (method !== 'SyncApi.readFileSync') {
        return invokeFileSystem(method, params, uri)
      }
      return readFile(uri)
    },
    refresh() {
      if (disposed) return false
      if (client.refreshWatch?.()) {
        // Creations can change project membership without an existing reference.
        changedFiles = undefined
        identities.clear()
        directories.clear()
        missing.clear()
        resolutionRoots.clear()
        dependencyLocks.clear()
        dependencyGenerations.clear()
        return true
      }
      try {
        const { changed, changedRoots } = refreshFileIdentities()
        // Validate non-dependency resolution state conservatively on every request.
        refreshResolution(changed, changedRoots)
        changedFiles = [...changed]
        return changed.size > 0
      } catch {
        // Without trustworthy evidence, conservatively retire every service.
        changedFiles = undefined
      }
      identities.clear()
      directories.clear()
      missing.clear()
      return true
    },
  }
}

const openMetadata = async (): Promise<FileMetadataCache | undefined> => {
  const handle = await openHandle('node-modules-metadata-v1')
  return handle ? createFileMetadataCache(handle) : undefined
}

const startWatching = async (): Promise<WatchDescriptor | null> => {
  try {
    return await Rpc.invoke('FileCache.startWatching')
  } catch {
    return null
  }
}

export const initialize = async (client: SyncRpc, fs: IFileSystem, cacheNodeModules = true): Promise<SyncRpc> => {
  const watchReady = startWatching()
  const [general, dependencies, metadata, descriptor] = await Promise.all([
    open('files-v1'),
    open('node-modules-v1'),
    openMetadata(),
    watchReady,
  ])
  const watch = descriptor
  const watchedClient = createWatchClient(client, watch, () => {
    if (watch) void Rpc.invoke('FileCache.stopWatching', watch.id).catch(() => {})
  })
  return createCachedClient(watchedClient, fs, general, dependencies, metadata, cacheNodeModules)
}
