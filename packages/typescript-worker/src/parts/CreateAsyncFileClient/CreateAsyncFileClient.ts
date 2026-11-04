import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'
import * as Rpc from '../Rpc/Rpc.ts'

type Invoke = (method: string, ...params: any[]) => Promise<any>
interface Entry {
  readonly method: string
  readonly params: readonly any[]
  error?: unknown
  ready: boolean
  value?: any
}

const read = async (invoke: Invoke, method: string, params: readonly any[]): Promise<any> => {
  switch (method) {
    case 'SyncApi.readFileSync':
      return invoke('FileSystem.readFile', ...params)
    case 'SyncApi.exists':
      return invoke('FileSystem.exists', ...params)
    case 'SyncApi.getWorkspaceUri':
      return invoke('FileSystem.getWorkspaceUri')
    case 'SyncApi.readDirSync':
      return (await invoke('FileSystem.readDir', ...params)).map((entry: any) => entry.name)
    case 'SyncApi.getDirectoriesSync':
      return (await invoke('FileSystem.readDir', ...params))
        .filter((entry: any) => entry.type === 3)
        .map((entry: any) => entry.name)
    default:
      throw new Error(`Unsupported asynchronous filesystem request: ${method}`)
  }
}

// TypeScript's host is synchronous. Discover its reads, resolve them asynchronously,
// then rebuild the speculative program until every read has an actual result.
// Each request owns its snapshot so edits and concurrent queries cannot reuse stale data.
export const createAsyncFileClient = (invoke: Invoke = Rpc.invoke): SyncRpc => {
  let entries: Map<string, Entry> | undefined
  let queue = Promise.resolve()
  let disposed = false
  const client: SyncRpc = {
    dispose() {
      disposed = true
    },
    invokeSync(method, ...params) {
      if (!entries) return undefined
      const key = JSON.stringify([method, ...params])
      let entry = entries.get(key)
      if (!entry) {
        if (entries.size >= 100_000) throw new Error('TypeScript filesystem snapshot exceeds 100000 requests')
        entry = { method, params, ready: false }
        entries.set(key, entry)
      }
      if (entry.ready) {
        if (entry.error) throw entry.error
        return entry.value
      }
      if (method === 'SyncApi.exists') return false
      if (method === 'SyncApi.getWorkspaceUri') return ''
      if (method === 'SyncApi.readDirSync' || method === 'SyncApi.getDirectoriesSync') return []
      return undefined
    },
    runRequest(fn, reset) {
      const result = queue.then(async () => {
        if (disposed) throw new Error('TypeScript filesystem client is disposed')
        entries = new Map()
        try {
          for (let round = 0; round < 256; round++) {
            if (disposed) throw new Error('TypeScript filesystem client is disposed')
            reset()
            let result: any
            let failure: unknown
            try {
              result = await fn()
            } catch (error) {
              failure = error
            }
            const pending = [...entries.values()].filter((entry) => !entry.ready)
            if (!pending.length) {
              if (failure) throw failure
              return result
            }
            for (let offset = 0; offset < pending.length; offset += 32) {
              await Promise.all(
                pending.slice(offset, offset + 32).map(async (entry) => {
                  try {
                    entry.value = await read(invoke, entry.method, entry.params)
                  } catch (error) {
                    entry.error = error
                  }
                  entry.ready = true
                }),
              )
            }
          }
          throw new Error('TypeScript filesystem snapshot did not converge after 256 rounds')
        } finally {
          reset()
          entries = undefined
        }
      })
      queue = result.then(
        () => {},
        () => {},
      )
      return result
    },
  }
  return client
}
