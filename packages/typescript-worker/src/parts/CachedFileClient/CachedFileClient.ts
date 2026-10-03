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
  if (!general && !dependencies) return client
  const identities = new Map<string, string | null | undefined>()
  const directories = new Map<string, string>()
  let disposed = false
  const getHashes = (uris: readonly string[]): readonly (string | null)[] => {
    const result = client.invokeSync('FileCache.getHashes', uris)
    if (!Array.isArray(result) || result.length !== uris.length) throw new Error('Invalid file identities')
    return result.map((hash) => (typeof hash === 'string' && /^[a-f0-9]{64}$/.test(hash) ? hash : null))
  }
  return {
    dispose() {
      if (disposed) return
      disposed = true
      general?.close()
      dependencies?.close()
      identities.clear()
      directories.clear()
    },
    invokeSync(method, ...params) {
      const uri = params[0]
      if (method !== 'SyncApi.readFileSync') {
        const value = client.invokeSync(method, ...params)
        if (method === 'SyncApi.exists' && !value) identities.set(uri, null)
        if (method === 'SyncApi.readDirSync') directories.set(uri, directoryIdentity(value))
        return value
      }
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
      if (hash && !disposed) {
        const cached = cache?.get(hash)
        if (cached !== undefined) return cached
      }
      const content = client.invokeSync(method, ...params)
      // A readable file without a trustworthy identity cannot retain a program snapshot.
      if (!hash) identities.set(uri, undefined)
      if (hash && !disposed && typeof content === 'string') cache?.set(hash, content)
      return content
    },
    refresh() {
      if (disposed) return false
      try {
        const uris = identities
          .keys()
          .filter((uri) => fs.readFile(uri) === undefined)
          .toArray()
        const hashes = uris.length > 0 ? getHashes(uris) : []
        let changed = hashes.some((hash, index) => hash !== identities.get(uris[index]))
        for (const [uri, identity] of directories) {
          const entries = client.invokeSync('SyncApi.readDirSync', uri)
          if (directoryIdentity(entries) !== identity) changed = true
        }
        if (!changed) return false
      } catch {
        // A failed identity lookup must not leave a stale program alive.
      }
      identities.clear()
      directories.clear()
      return true
    },
  }
}

export const initialize = async (client: SyncRpc, fs: IFileSystem): Promise<SyncRpc> => {
  const [general, dependencies] = await Promise.all([open('files-v1'), open('node-modules-v1')])
  return createCachedClient(client, fs, general, dependencies)
}
