export const waitForSyncRpcResult = (
  handle: FileSystemSyncAccessHandle,
  maxWaitTime: number,
  sharedBuffer: SharedArrayBuffer | undefined,
): boolean => {
  if (sharedBuffer) {
    const intArray = new Int32Array(sharedBuffer)
    Atomics.wait(intArray, 0, 1, maxWaitTime)
  }
  const start = Date.now()
  const end = start + maxWaitTime
  let errcount = 0
  const buffer = new Uint8Array([2])
  while (true) {
    const now = Date.now()
    if (now >= end) {
      return false
    }
    handle.read(buffer, { at: 0 })
    if (buffer[0] === 1) {
      return true
    }
    errcount++
  }
}
