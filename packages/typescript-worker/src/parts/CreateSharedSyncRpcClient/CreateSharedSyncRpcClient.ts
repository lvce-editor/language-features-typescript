import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'
import * as Rpc from '../Rpc/Rpc.ts'

// Header: state (0 pending, 1 chunk, 2 final, 3 cancelled), byte length.
// The consumer acknowledges each non-final chunk before the producer reuses it.
export const createSharedSyncRpcClient = async (syncId: number, maxDelay: number): Promise<SyncRpc> => {
  const shared = new SharedArrayBuffer(8 + 64 * 1024)
  const header = new Int32Array(shared, 0, 2)
  const bytes = new Uint8Array(shared, 8)
  await Rpc.invoke('SyncApi.setupShared', syncId, shared, maxDelay)
  let failed = false
  return {
    invokeSync(method, ...params) {
      if (failed) {
        throw new Error('Synchronous RPC client is unavailable after a timeout')
      }
      Atomics.store(header, 0, 0)
      void Rpc.invoke(method, syncId, ...params)
      const deadline = performance.now() + maxDelay
      const decoder = new TextDecoder()
      let content = ''
      while (true) {
        const remaining = deadline - performance.now()
        if (remaining <= 0 || Atomics.wait(header, 0, 0, remaining) === 'timed-out') {
          failed = true
          Atomics.store(header, 0, 3)
          Atomics.notify(header, 0)
          throw new Error(`Rpc error: timeout of ${maxDelay}ms exceeded`)
        }
        const state = Atomics.load(header, 0)
        content += decoder.decode(bytes.slice(0, Atomics.load(header, 1)), { stream: state !== 2 })
        if (state === 2) {
          const response = JSON.parse(content)
          if (response.error) {
            throw new Error(response.error.message)
          }
          return response.result
        }
        Atomics.store(header, 0, 0)
        Atomics.notify(header, 0)
      }
    },
  }
}
