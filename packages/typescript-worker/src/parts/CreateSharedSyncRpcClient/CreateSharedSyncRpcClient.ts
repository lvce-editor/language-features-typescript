import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'
import * as Rpc from '../Rpc/Rpc.ts'

const decodeResult = (content: string, textAccessHandle: FileSystemSyncAccessHandle | undefined): any => {
  const response = JSON.parse(content)
  if (response.error) throw new Error(response.error.message)
  if (response.__textTransfer !== 'opfs') return response.result
  if (!textAccessHandle) throw new Error('OPFS text response received without a synchronous file handle')
  const text = new Uint8Array(textAccessHandle.getSize())
  textAccessHandle.read(text, { at: 0 })
  return new TextDecoder().decode(text)
}

const isSharedText = (content: string): boolean => {
  try {
    return JSON.parse(content).__textTransfer === 'shared'
  } catch {
    // Regular JSON responses can span multiple chunks.
    return false
  }
}

// Header: state (0 pending, 1 chunk, 2 final, 3 cancelled), byte length.
// The consumer acknowledges each non-final chunk before the producer reuses it.
export const createSharedSyncRpcClient = async (syncId: number, maxDelay: number): Promise<SyncRpc> => {
  const shared = new SharedArrayBuffer(8 + 64 * 1024)
  const header = new Int32Array(shared, 0, 2)
  const bytes = new Uint8Array(shared, 8)
  let textHandle: FileSystemFileHandle | undefined
  let textAccessHandle: FileSystemSyncAccessHandle | undefined
  let root: FileSystemDirectoryHandle | undefined
  const textFileName = `file-content-${crypto.randomUUID()}.txt`
  try {
    root = await navigator.storage.getDirectory()
    textHandle = await root.getFileHandle(textFileName, { create: true })
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
    async dispose() {
      failed = true
      try {
        await Rpc.invoke('SyncApi.dispose', syncId)
      } finally {
        textAccessHandle?.close()
        if (root && textHandle) await root.removeEntry(textFileName)
      }
    },
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
        content += decoder.decode(chunk, { stream: state !== 2 })
        if (state === 2) {
          return sharedText ? content : decodeResult(content, textAccessHandle)
        }
        if (!sharedText && isSharedText(content)) {
          sharedText = true
          content = ''
        }
        Atomics.store(header, 0, 0)
        Atomics.notify(header, 0)
      }
    },
  }
}
