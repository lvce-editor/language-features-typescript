import type { SyncRpc, WatchStatistics } from '../SyncRpc/SyncRpc.ts'

export interface WatchDescriptor {
  readonly active: boolean
  readonly files: readonly string[]
  readonly id: number
  readonly revision: number
  readonly roots: readonly string[]
}

const normalize = (uri: string): string => {
  let path = uri.replaceAll('\\', '/')
  if (path.startsWith('//')) path = `file:${path}`
  else if (path.startsWith('/')) path = `file://${path}`
  else if (/^[a-zA-Z]:\//.test(path)) path = `file:///${path}`
  return path.startsWith('file://') ? new URL(path).href : path
}

const copy = (value: any): any => (Array.isArray(value) ? [...value] : value)

export const trackTransport = (client: SyncRpc): SyncRpc => {
  const counts: Record<string, number> = Object.create(null)
  return {
    ...client,
    getTransportStatistics: () => ({ ...counts }),
    invokeSync(method, ...params) {
      counts[method] = (counts[method] || 0) + 1
      return client.invokeSync(method, ...params)
    },
  }
}

export const createWatchClient = (
  client: SyncRpc,
  descriptor: WatchDescriptor | null,
  disposeWatch: () => void,
): SyncRpc => {
  let active = descriptor?.active === true
  let revision = descriptor?.revision || 0
  let watchState: WatchStatistics = { active, revision }
  const roots = descriptor?.roots.map((uri) => normalize(uri).replace(/\/$/, '')) || []
  const files = new Set(descriptor?.files.map(normalize))
  const transport: Record<string, number> = Object.create(null)
  const invoke = (method: string, ...params: readonly any[]): any => {
    transport[method] = (transport[method] || 0) + 1
    return client.invokeSync(method, ...params)
  }
  const values = new Map<string, Map<string, any>>()
  const hashes = new Map<string, string | null>()
  const clear = (): void => {
    values.clear()
    hashes.clear()
  }
  const isWatchedPath = (uri: string): boolean => {
    if (!active) return false
    const path = normalize(uri)
    return files.has(path) || roots.some((root) => path === root || path.startsWith(`${root}/`))
  }
  const readHashes = (uris: readonly string[]): readonly any[] => {
    try {
      const result = invoke('FileCache.getHashes', uris)
      if (!Array.isArray(result) || result.length !== uris.length) throw new Error('Invalid file identities')
      return result
    } catch (error) {
      // Healthy watches can retain memory contents even without optional hashes.
      for (const uri of uris) if (isWatchedPath(uri)) hashes.set(normalize(uri), null)
      if (uris.some((uri) => !isWatchedPath(uri))) throw error
      return uris.map(() => null)
    }
  }
  const getHashes = (uris: readonly string[]): any => {
    const missing = uris.filter((uri) => !isWatchedPath(uri) || !hashes.has(normalize(uri)))
    const current = new Map<string, any>()
    if (missing.length > 0) {
      const result = readHashes(missing)
      for (const [index, uri] of missing.entries()) {
        const value = result[index]
        const path = normalize(uri)
        current.set(path, value)
        if (isWatchedPath(uri) && (value === null || (typeof value === 'string' && /^[a-f0-9]{64}$/.test(value))))
          hashes.set(path, value)
      }
    }
    return uris.map((uri) => (hashes.has(normalize(uri)) ? hashes.get(normalize(uri)) : current.get(normalize(uri))))
  }
  return {
    clearReferences() {
      clear()
      client.clearReferences?.()
    },
    dispose() {
      active = false
      clear()
      disposeWatch()
      client.dispose?.()
    },
    forgetReferences(uris) {
      for (const uri of uris) {
        values.delete(normalize(uri))
        hashes.delete(normalize(uri))
      }
      client.forgetReferences?.(uris)
    },
    getTransportStatistics: () => client.getTransportStatistics?.() || { ...transport },
    getWatchStatistics: () => ({ ...watchState }),
    invokeSync(method, ...params) {
      if (method === 'FileCache.getHashes') return getHashes(params[0])
      const uri = params[0]
      if (
        typeof uri !== 'string' ||
        !isWatchedPath(uri) ||
        !['SyncApi.exists', 'SyncApi.readDirSync', 'SyncApi.readFileSync', 'SyncApi.getDirectoriesSync'].includes(
          method,
        )
      ) {
        return invoke(method, ...params)
      }
      const path = normalize(uri)
      const entry = values.get(path) || new Map<string, any>()
      if (entry.has(method)) return copy(entry.get(method))
      const value = invoke(method, ...params)
      entry.set(method, copy(value))
      values.set(path, entry)
      return value
    },
    isWatchedPath,
    refreshWatch() {
      if (!active || !descriptor) return undefined
      try {
        const state = invoke('FileCache.getWatchState', descriptor.id)
        watchState = state ? { ...state } : { active: false, revision }
        if (state?.active !== true || !Number.isSafeInteger(state.revision)) {
          throw new Error('File watching is unavailable')
        }
        const { revision: nextRevision } = state
        if (nextRevision === revision) return undefined
        revision = nextRevision
        clear()
        return 'changed'
      } catch {
        watchState = { ...watchState, active: false }
        active = false
        clear()
        return 'failed'
      }
    },
  }
}
