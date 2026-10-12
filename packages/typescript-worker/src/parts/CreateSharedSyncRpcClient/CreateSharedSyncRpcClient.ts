import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'
import * as Rpc from '../Rpc/Rpc.ts'

// Header: state (0 pending, 1 chunk, 2 final, 3 cancelled), byte length.
// The consumer acknowledges each non-final chunk before the producer reuses it.
export const createSharedSyncRpcClient = async (syncId: number, maxDelay: number): Promise<SyncRpc> => {
  const shared = new SharedArrayBuffer(8 + 64 * 1024)
  const header = new Int32Array(shared, 0, 2)
  const bytes = new Uint8Array(shared, 8)
  let textHandle: FileSystemFileHandle | undefined
  let textAccessHandle: FileSystemSyncAccessHandle | undefined
  try {
    const root = await navigator.storage.getDirectory()
    textHandle = await root.getFileHandle(`file-content-${syncId}.txt`, { create: true })
    if (typeof textHandle.createSyncAccessHandle === 'function') {
      // @ts-ignore
      textAccessHandle = await textHandle.createSyncAccessHandle({ mode: 'readwrite-unsafe' })
    }
  } catch {
    // Firefox and other browsers without synchronous OPFS access use the raw shared-text path.
  }
  await Rpc.invoke('SyncApi.setupShared', syncId, shared, maxDelay, textAccessHandle ? textHandle : undefined)
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
      let sharedText = false
      while (true) {
        const remaining = deadline - performance.now()
        if (remaining <= 0 || Atomics.wait(header, 0, 0, remaining) === 'timed-out') {
          failed = true
          Atomics.store(header, 0, 3)
          Atomics.notify(header, 0)
          throw new Error(`Rpc error: timeout of ${maxDelay}ms exceeded`)
        }
        const state = Atomics.load(header, 0)
        const chunk = bytes.slice(0, Atomics.load(header, 1))
        if (sharedText) {
          content += decoder.decode(chunk, { stream: state !== 2 })
          if (state === 2) {
            return content
          }
        } else {
          content += decoder.decode(chunk, { stream: state !== 2 })
        }
        if (state === 2) {
          const response = JSON.parse(content)
          if (response.error) {
            throw new Error(response.error.message)
          }
          if (response.__textTransfer === 'opfs') {
            if (!textAccessHandle) {
              throw new Error('OPFS text response received without a synchronous file handle')
            }
            const textSize = textAccessHandle.getSize()
            const text = new Uint8Array(textSize)
            textAccessHandle.read(text, { at: 0 })
            return new TextDecoder().decode(text)
          }
          return response.result
        }
        if (!sharedText) {
          try {
            const response = JSON.parse(content)
            if (response.__textTransfer === 'shared') {
              sharedText = true
              content = ''
            }
          } catch {
            // A non-final regular JSON response may not be complete until another chunk arrives.
          }
        }
        Atomics.store(header, 0, 0)
        Atomics.notify(header, 0)
      }
    },
  }
}
