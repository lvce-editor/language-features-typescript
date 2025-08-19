export const waitForSyncRpcResult = (handle: FileSystemSyncAccessHandle, maxWaitTime: number, file: File): boolean => {
  const start = Date.now()
  const end = start + maxWaitTime
  let errcount = 0
  const buffer = new Uint8Array([2])
  let lastRead = 0
  while (true) {
    const now = Date.now()
    if (now >= end) {
      return false
    }
    lastRead = handle.read(buffer, { at: 0 })
    if (buffer[0] === 1) {
      return true
    }
    errcount++
  }
}
