export const waitForSyncRpcResult = (handle: FileSystemSyncAccessHandle) => {
  for (let i = 0; i < 1_000; i++) {
    // console.time('read')
    const buffer = new Uint8Array([0])
    const readBuffer = handle.read(buffer, { at: 0 })
    // console.timeEnd('read')
    if (buffer[0] === 1) {
      break
    }
  }
}
