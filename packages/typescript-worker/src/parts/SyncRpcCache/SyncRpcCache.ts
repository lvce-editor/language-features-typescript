import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'

type RequestCache = WeakMap<SyncRpc, Map<string, Map<string, unknown>>>

const state: { activeCache?: RequestCache } = {}

// The callback must be synchronous: discard the snapshot before another command can run.
export const withRequestCache = <T>(callback: () => T): T => {
  const previous = state.activeCache
  state.activeCache = new WeakMap()
  try {
    return callback()
  } finally {
    state.activeCache = previous
  }
}

export const createCachedClient = (client: SyncRpc): SyncRpc => ({
  invokeSync(method, ...params) {
    const cache = state.activeCache
    const uri = params[0]
    if (
      !cache ||
      params.length !== 1 ||
      typeof uri !== 'string' ||
      (method !== 'SyncApi.exists' && method !== 'SyncApi.readFileSync')
    ) {
      return client.invokeSync(method, ...params)
    }
    let methods = cache.get(client)
    if (!methods) {
      methods = new Map()
      cache.set(client, methods)
    }
    let values = methods.get(method)
    if (!values) {
      values = new Map()
      methods.set(method, values)
    }
    if (values.has(uri)) {
      return values.get(uri)
    }
    const result = client.invokeSync(method, ...params)
    values.set(uri, result)
    return result
  },
})
