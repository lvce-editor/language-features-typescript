import { createBuffer } from '../CreateBuffer/CreateBuffer.ts'
import { readJsonFromHandle } from '../ReadJsonFromHandle/ReadJsonFromHandle.ts'
import * as Rpc from '../Rpc/Rpc.ts'
import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'
import { waitForSyncRpcResult } from '../WaitForSyncRpcResult/WaitForSyncRpcResult.ts'

const readJsonFromHandle = (handle: FileSystemSyncAccessHandle, size: number): any => {
  const buf = new Uint8Array(size)
  handle.read(buf)
  const text = new TextDecoder().decode(buf)
  const parsed = JSON.parse(text)
  return parsed
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
  const errorHandle = await root.getFileHandle(errorFileName, { create: true })
  // @ts-ignore
  const accessHandle = await draftHandle.createSyncAccessHandle({
    mode: 'readwrite-unsafe',
  })
  // @ts-ignore
  const resultAccessHandle = await resultHandle.createSyncAccessHandle({
    mode: 'readwrite-unsafe',
  })
  // @ts-ignore
  const errorAccessHandle = await errorHandle.createSyncAccessHandle({
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
      errorAccessHandle.truncate(0)
      errorAccessHandle.flush()
      Rpc.invoke(method, syncId, ...params)
      const maxDelay = 5_000
      const hasResult = waitForSyncRpcResult(accessHandle, maxDelay, buffer)
      if (!hasResult) {
        throw new Error(`Rpc error: timeout of ${maxDelay}ms exceeded`)
      }
      const errorSize = errorAccessHandle.getSize()
      if (errorSize > 0) {
        const parsedError = readJsonFromHandle(errorAccessHandle, errorSize)
        throw new Error(parsedError.message)
      }
      const size = resultAccessHandle.getSize()
      const parsed = readJsonFromHandle(resultAccessHandle, size)
      return parsed
    },
  }
}
