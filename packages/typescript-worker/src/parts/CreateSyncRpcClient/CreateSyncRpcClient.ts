import { createBuffer } from '../CreateBuffer/CreateBuffer.ts'
import { readJsonFromHandle } from '../ReadJsonFromHandle/ReadJsonFromHandle.ts'
import * as Rpc from '../Rpc/Rpc.ts'
import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'
import { waitForSyncRpcResult } from '../WaitForSyncRpcResult/WaitForSyncRpcResult.ts'
import * as WaitForSyncBufferResultType from '../WaitForSyncBufferResultType/WaitForSyncBufferResultType.ts'
import type { SyncClientOptions } from '../SyncClientOptions/SyncClientOptions.ts'

export const createSyncRpcClient = async ({
  maxDelay,
  crossOriginIsolated,
  syncId,
}: SyncClientOptions): Promise<SyncRpc> => {
  const buffer = createBuffer(crossOriginIsolated)
  const statusFileName = 'draft.txt'
  const resultFileName = 'result.txt'
  const errorFileName = 'error.txt'
  const root = await navigator.storage.getDirectory()
  const [draftHandle, resultHandle, errorHandle] = await Promise.all([
    root.getFileHandle(statusFileName, { create: true }),
    root.getFileHandle(resultFileName, { create: true }),
    root.getFileHandle(errorFileName, { create: true }),
  ])
  await Rpc.invoke(
    'SyncApi.setup',
    syncId,
    buffer,
    statusFileName,
    resultFileName,
    errorFileName,
    draftHandle,
    resultHandle,
    errorHandle,
  )

  const [accessHandle, resultAccessHandle, errorAccessHandle] = await Promise.all([
    // @ts-ignore
    draftHandle.createSyncAccessHandle({
      mode: 'readwrite-unsafe',
    }),
    // @ts-ignore
    resultHandle.createSyncAccessHandle({
      mode: 'readwrite-unsafe',
    }),
    // @ts-ignore
    errorHandle.createSyncAccessHandle({
      mode: 'readwrite-unsafe',
    }),
  ])

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
      const resultType = waitForSyncRpcResult(accessHandle, maxDelay, buffer)
      if (resultType === WaitForSyncBufferResultType.Timeout) {
        throw new Error(`Rpc error: timeout of ${maxDelay}ms exceeded`)
      }
      if (resultType === WaitForSyncBufferResultType.NotEqual) {
        throw new Error(`Rpc error: Buffer did not change`)
      }
      if (resultType === WaitForSyncBufferResultType.Other) {
        throw new Error(`Rpc error: Unexpected buffer errot`)
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
