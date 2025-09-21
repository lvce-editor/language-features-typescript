import * as WaitForSyncBufferResultType from '../WaitForSyncBufferResultType/WaitForSyncBufferResultType.ts'

export const waitForSyncRpcResultFile = (handle: FileSystemSyncAccessHandle, maxWaitTime: number): number => {
  const start = Date.now()
  const end = start + maxWaitTime
  let errcount = 0
  const buffer = new Uint8Array([2])
  while (true) {
    const now = Date.now()
    if (now >= end) {
      return WaitForSyncBufferResultType.Timeout
    }
    handle.read(buffer, { at: 0 })
    if (buffer[0] === 1) {
      return WaitForSyncBufferResultType.Ok
    }
    errcount++
  }
}
