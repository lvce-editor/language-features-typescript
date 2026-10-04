import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'

// TypeScript makes many identical filesystem probes while building a program.
// Share results only during synchronous work; discard them before another task
// can run so subsequent requests observe filesystem changes.
export const createCachedSyncRpcClient = (client: SyncRpc): SyncRpc => {
  const caches = new Map<string, Map<string, any>>()
  return {
    invokeSync(method, ...params) {
      if (
        (method !== 'SyncApi.exists' && method !== 'SyncApi.readFileSync') ||
        params.length !== 1 ||
        typeof params[0] !== 'string'
      ) {
        return client.invokeSync(method, ...params)
      }
      const path = params[0]
      const cached = caches.get(method)
      if (cached?.has(path)) {
        return cached.get(path)
      }
      const result = client.invokeSync(method, path)
      if (caches.size === 0) {
        queueMicrotask(() => caches.clear())
      }
      const cache = cached || new Map<string, any>()
      cache.set(path, result)
      caches.set(method, cache)
      return result
    },
  }
}
