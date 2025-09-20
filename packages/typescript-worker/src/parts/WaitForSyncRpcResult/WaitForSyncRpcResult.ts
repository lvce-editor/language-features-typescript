import { waitForSyncRpcResultBuffer } from '../WaitForSyncRpcResultBuffer/WaitForSyncRpcResultBuffer.ts'
import { waitForSyncRpcResultFile } from '../WaitForSyncRpcResultFile/WaitForSyncRpcResultFile.ts'

export const waitForSyncRpcResult = (
  handle: FileSystemSyncAccessHandle,
  maxWaitTime: number,
  sharedBuffer: Int32Array | undefined,
): boolean => {
  console.log({ sharedBuffer })
  if (sharedBuffer) {
    return waitForSyncRpcResultBuffer(maxWaitTime, sharedBuffer)
  }
  return waitForSyncRpcResultFile(handle, maxWaitTime)
}
