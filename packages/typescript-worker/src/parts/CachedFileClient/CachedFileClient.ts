import type { FileContentCache, SyncHandle } from '../FileContentCache/FileContentCache.ts'
import type { IFileSystem } from '../IFileSystem/IFileSystem.ts'
import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'
import { createFileContentCache } from '../FileContentCache/FileContentCache.ts'
import * as Rpc from '../Rpc/Rpc.ts'

interface CacheFileHandle {
  createSyncAccessHandle(): Promise<SyncHandle>
}

const open = async (name: string): Promise<FileContentCache | undefined> => {
  try {
    const file: CacheFileHandle = await Rpc.invoke('FileCache.getHandle', name)
    return createFileContentCache(await file.createSyncAccessHandle())
  } catch {
    // Another worker may own the exclusive lock, or OPFS may be unavailable.
    return undefined
  }
}

const directoryIdentity = (value: readonly string[]): string =>
  JSON.stringify(value.toSorted((a, b) => a.localeCompare(b)))

export const createCachedClient = (
  client: SyncRpc,
  fs: IFileSystem,
  general: FileContentCache | undefined,
  dependencies: FileContentCache | undefined,
): SyncRpc => {
  const identities = new Map<string, string | null | undefined>()
  const directories = new Map<string, string>()
  const missing = new Set<string>()
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
  const readFile = (uri: string) => {
    const live = fs.readFile(uri)
    if (live !== undefined) return live
    const cache = /(^|[/\\])node_modules[/\\]/.test(uri) ? dependencies : general
    let hash: string | null = null
    try {
      hash = getHashes([uri])[0]
    } catch {
      // Source reads remain available when the optional hashing API fails.
    }
    identities.set(uri, hash)
    if (hash) {
      const cached = cache?.get(hash)
      if (cached !== undefined) {
        if (cache === dependencies) statistics.dependencyHits++
        else statistics.generalHits++
        return cached
      }
    }
    statistics.sourceReads++
    const content = client.invokeSync('SyncApi.readFileSync', uri)
    // A readable file without a trustworthy identity cannot retain a program snapshot.
    if (!hash) identities.set(uri, undefined)
    if (hash && typeof content === 'string') cache?.set(hash, content)
    return content
  }
  return {
    clearReferences() {
      identities.clear()
      directories.clear()
      missing.clear()
    },
    dispose() {
      if (disposed) return
      disposed = true
      general?.close()
      dependencies?.close()
      identities.clear()
      directories.clear()
      missing.clear()
    },
    forgetReferences(uris) {
      for (const uri of uris) {
        identities.delete(uri)
        directories.delete(uri)
        missing.delete(uri)
      }
    },
    getChangedFiles: () => changedFiles,
    getCacheStatistics: () => ({ ...statistics }),
    invokeSync(method, ...params) {
      if (disposed) return client.invokeSync(method, ...params)
      const uri = params[0]
      if (method !== 'SyncApi.readFileSync') {
        const value = client.invokeSync(method, ...params)
        if (method === 'SyncApi.exists' && !value) missing.add(uri)
        if (method === 'SyncApi.readDirSync') directories.set(uri, directoryIdentity(value))
        return value
      }
      return readFile(uri)
    },
    refresh() {
      if (disposed) return false
      try {
        const uris = identities
          .keys()
          .filter((uri) => fs.readFile(uri) === undefined)
          .toArray()
        const hashes = uris.length > 0 ? getHashes(uris) : []
        const changed = new Set<string>()
        for (const [index, hash] of hashes.entries()) {
          const uri = uris[index]
          if (hash !== identities.get(uri)) changed.add(uri)
          // Unverifiable readable files are checked again on every request.
          if (identities.get(uri) !== undefined) identities.set(uri, hash)
        }
        for (const uri of missing) {
          if (client.invokeSync('SyncApi.exists', uri)) {
            changed.add(uri)
            missing.delete(uri)
          }
        }
        for (const [uri, identity] of directories) {
          const entries = directoryIdentity(client.invokeSync('SyncApi.readDirSync', uri))
          if (entries !== identity) changed.add(uri)
          directories.set(uri, entries)
        }
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

export const initialize = async (client: SyncRpc, fs: IFileSystem): Promise<SyncRpc> => {
  const [general, dependencies] = await Promise.all([open('files-v1'), open('node-modules-v1')])
  return createCachedClient(client, fs, general, dependencies)
}
