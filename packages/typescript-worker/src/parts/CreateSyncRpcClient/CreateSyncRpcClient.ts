import * as Rpc from '../Rpc/Rpc.ts'
import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'
import { waitForSyncRpcResult } from '../WaitForSyncRpcResult/WaitForSyncRpcResult.ts'

export const createSyncRpcClient = async (): Promise<SyncRpc> => {
  const syncId = 1
  await Rpc.invoke('SyncApi.setup', syncId)
  const root = await navigator.storage.getDirectory()
  const draftHandle = await root.getFileHandle('draft.txt', { create: true })
  const resultHandle = await root.getFileHandle('result.txt', { create: true })
  // Get sync access handle

  // const f =await draftHandle.getFile()
  // f.lastModified
  const accessHandle = await draftHandle.createSyncAccessHandle({
    mode: 'readwrite-unsafe',
  })
  accessHandle.write(new Uint8Array([0]), { at: 0 })
  accessHandle.flush()

  const resultAccessHandle = await resultHandle.createSyncAccessHandle({
    mode: 'readwrite-unsafe',
  })
  // accessHandle.close()

  // const accessHandle2 = await draftHandle.createSyncAccessHandle({ mode: 'readwrite-unsafe' })
  // const resultAccessHandle = await resultHandle.createSyncAccessHandle()

  // Get size of the file.
  // const fileSize = accessHandle.getSize()
  // Read file content to a buffer.
  // const buffer = new DataView(new ArrayBuffer(fileSize))
  console.time('read')
  // const readBuffer = accessHandle.read(buffer, { at: 0 })
  console.timeEnd('read')
  return {
    invokeSync(method, ...params) {
      // accessHandle.write(new Uint8Array([0]), { at: 0 })
      // accessHandle.flush()
      // accessHandle.close()
      Rpc.invoke(method, syncId, ...params)
      console.time('wait')
      const maxDelay = 1_000
      waitForSyncRpcResult(accessHandle, maxDelay)
      console.timeEnd('wait')
      console.log('done')
      const size = resultAccessHandle.getSize()
      const buf = new Uint8Array(size)
      resultAccessHandle.read(buf)
      const text = new TextDecoder().decode(buf)
      console.log({ text })
      // TODO write to request file '0'
      // TODO send message to extension host worker, requesting sync access to given method
      // TODO read request file, until it is '1'
      // TODO read result file
    },
  }
}
