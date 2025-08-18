import * as Rpc from '../Rpc/Rpc.ts'
import type { SyncRpc } from '../SyncRpc/SyncRpc.ts'
import { waitForSyncRpcResult } from '../WaitForSyncRpcResult/WaitForSyncRpcResult.ts'

export const createSyncRpcClient = async (): Promise<SyncRpc> => {
  const syncId = 1
  await Rpc.invoke('SyncApi.setup', syncId)
  const root = await navigator.storage.getDirectory()
  const draftHandle = await root.getFileHandle('draft.txt', { create: true })
  const resultHandle = await root.getFileHandle('result.txt', { create: true })

  // f.size
  // draftHandle.createSyncAccessHandle()
  // Get sync access handle

  // const f =await draftHandle.getFile()
  // f.lastModified
  const accessHandle = await draftHandle.createSyncAccessHandle({
    mode: 'readwrite-unsafe',
  })

  const f = await draftHandle.getFile()
  console.log({ initial: f.size })

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
      accessHandle.write(new Uint8Array([0]), { at: 0 })
      accessHandle.truncate(1)
      accessHandle.flush()

      resultAccessHandle.truncate(0)
      resultAccessHandle.flush()
      Rpc.invoke(method, syncId, ...params)
      console.time('wait')
      const maxDelay = 1_000
      const hasResult = waitForSyncRpcResult(accessHandle, maxDelay, f)
      if (!hasResult) {
        throw new Error(`Rpc error: timeout of ${maxDelay}ms exceeded`)
      }
      console.timeEnd('wait')
      console.log('done')
      const size = resultAccessHandle.getSize()
      const buf = new Uint8Array(size)
      resultAccessHandle.read(buf)
      const text = new TextDecoder().decode(buf)
      const parsed = JSON.parse(text)
      draftHandle
        .getFile()
        .then((x) => x.size)
        .then((x) => console.log({ x }))
      return parsed
    },
  }
}
