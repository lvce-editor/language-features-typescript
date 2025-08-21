import * as Rpc from '../Rpc/Rpc.ts'
import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'
import { waitForSyncRpcResult } from '../WaitForSyncRpcResult/WaitForSyncRpcResult.ts'

const createBuffer = (isolated: boolean): Int32Array | undefined => {
  if (!isolated) {
    return undefined
  }
  return new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT))
}

export const createSyncRpcClient = async (): Promise<SyncRpc> => {
  const syncId = 1
  const isolated = globalThis.crossOriginIsolated
  const buffer = createBuffer(isolated)
  const statusFileName = 'draft.txt'
  const resultFileName = 'result.txt'
  const errorFileName = 'error.txt'
  await Rpc.invoke('SyncApi.setup', syncId, buffer, statusFileName, resultFileName, errorFileName)
  const root = await navigator.storage.getDirectory()
  const draftHandle = await root.getFileHandle(statusFileName, { create: true })
  const resultHandle = await root.getFileHandle(resultFileName, { create: true })
  // @ts-ignore
  const accessHandle = await draftHandle.createSyncAccessHandle({
    mode: 'readwrite-unsafe',
  })

  // @ts-ignore
  const resultAccessHandle = await resultHandle.createSyncAccessHandle({
    mode: 'readwrite-unsafe',
  })
  return {
    invokeSync(method, ...params) {
      if (buffer) {
        buffer[0] = 0
      }
      accessHandle.write(new Uint8Array([0]), { at: 0 })
      accessHandle.truncate(1)
      accessHandle.flush()
      resultAccessHandle.truncate(0)
      resultAccessHandle.flush()
      Rpc.invoke(method, syncId, ...params)
      const maxDelay = 1_000
      const hasResult = waitForSyncRpcResult(accessHandle, maxDelay, buffer)
      if (!hasResult) {
        throw new Error(`Rpc error: timeout of ${maxDelay}ms exceeded`)
      }
      const size = resultAccessHandle.getSize()
      const buf = new Uint8Array(size)
      resultAccessHandle.read(buf)
      const text = new TextDecoder().decode(buf)
      const parsed = JSON.parse(text)
      return parsed
    },
  }
}
