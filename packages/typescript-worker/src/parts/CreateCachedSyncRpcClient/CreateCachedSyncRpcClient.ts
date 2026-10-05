import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'

// Directory names can disprove existence, but cannot prove it (e.g. dangling
// symlinks). Fold ASCII names to avoid false negatives on case-insensitive disks.
const getProbe = (path: string): { directory: string; name: string } | undefined => {
  if (/[\\?#]/.test(path)) return undefined
  const end = path.lastIndexOf('/')
  if (end < 0 || end === path.length - 1) return undefined
  let name = path.slice(end + 1)
  if (path.includes('://')) {
    try {
      name = decodeURIComponent(name)
    } catch {
      return undefined
    }
  }
  if (name === '.' || name === '..' || /[^\x20-\x7e]|[/\\]/.test(name)) return undefined
  // Retain the separator, including for POSIX, drive and URI roots.
  return { directory: path.slice(0, end + 1), name: name.toLowerCase() }
}

// Share metadata only during synchronous work. Clearing before another task
// observes creation/deletion without adding long-lived negative cache entries.
export const createCachedSyncRpcClient = (client: SyncRpc): SyncRpc => {
  const caches = new Map<string, Map<string, any>>()
  const directories = new Map<string, Set<string> | undefined>()
  const probedDirectories = new Set<string>()
  let clearPending = false
  const scheduleClear = (): void => {
    if (clearPending) return
    clearPending = true
    queueMicrotask(() => {
      caches.clear()
      directories.clear()
      probedDirectories.clear()
      clearPending = false
    })
  }
  const rememberDirectory = (directory: string, entries: unknown): void => {
    scheduleClear()
    // Unknown names/large directories use ordinary existence queries. Unicode
    // normalization and case rules are provider-specific, so do not guess.
    const safe =
      Array.isArray(entries) &&
      entries.length <= 1024 &&
      entries.every((name) => typeof name === 'string' && !/[^\x20-\x7e]|[/\\]/.test(name))
    directories.set(
      directory.endsWith('/') ? directory : `${directory}/`,
      safe ? new Set(entries.map((name) => name.toLowerCase())) : undefined,
    )
  }
  return {
    invokeSync(method, ...params) {
      if (method === 'SyncApi.readDirSync' && params.length === 1 && typeof params[0] === 'string') {
        const result = client.invokeSync(method, ...params)
        rememberDirectory(params[0], result)
        return result
      }
      if (
        (method !== 'SyncApi.exists' && method !== 'SyncApi.readFileSync') ||
        params.length !== 1 ||
        typeof params[0] !== 'string'
      ) {
        return client.invokeSync(method, ...params)
      }
      const path = params[0]
      const cached = caches.get(method)
      if (cached?.has(path)) return cached.get(path)
      const probe = method === 'SyncApi.exists' ? getProbe(path) : undefined
      if (probe && !directories.has(probe.directory) && probedDirectories.has(probe.directory)) {
        try {
          rememberDirectory(probe.directory, client.invokeSync('SyncApi.readDirSync', probe.directory))
        } catch {
          // Listing may be unsupported, inaccessible or missing. Fall back to
          // exact existence checks, and do not repeatedly retry this turn.
          rememberDirectory(probe.directory, undefined)
        }
      }
      const names = probe && directories.get(probe.directory)
      const result = names && !names.has(probe!.name) ? false : client.invokeSync(method, path)
      scheduleClear()
      if (probe) probedDirectories.add(probe.directory)
      const cache = cached || new Map<string, any>()
      cache.set(path, result)
      caches.set(method, cache)
      return result
    },
  }
}
