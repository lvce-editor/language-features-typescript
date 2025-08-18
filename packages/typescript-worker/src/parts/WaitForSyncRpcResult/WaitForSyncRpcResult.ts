export const waitForSyncRpcResult = (
  handle: FileSystemSyncAccessHandle,
  maxWaitTime: number,
  file: File,
): Promise<boolean> => {
  const start = Date.now()
  const end = start + maxWaitTime
  let errcount = 0
  const buffer = new Uint8Array([2])
  let lastRead = 0
  while (true) {
    const now = Date.now()
    if (now >= end) {
      console.log({ errcount, el: buffer[0], lastRead, size: file.size })
      return false
    }
    // console.time('read')
    lastRead = handle.read(buffer, { at: 0 })
    // console.timeEnd('read')
    if (buffer[0] === 1) {
      console.log({ errcount, el: buffer[0], lastRead, size: file.size })
      return true
    }
    errcount++
  }
}
