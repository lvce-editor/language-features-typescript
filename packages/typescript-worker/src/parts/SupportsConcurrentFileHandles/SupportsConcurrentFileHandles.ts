export const supportsConcurrentFileHandles = async (): Promise<boolean> => {
  let first: FileSystemSyncAccessHandle | undefined
  let second: FileSystemSyncAccessHandle | undefined
  let root: FileSystemDirectoryHandle | undefined
  const name = `typescript-transport-probe-${crypto.randomUUID()}`
  try {
    root = await navigator.storage.getDirectory()
    const file = await root.getFileHandle(name, { create: true })
    // Firefox accepts the options but retains an exclusive lock.
    // @ts-ignore
    first = await file.createSyncAccessHandle({ mode: 'readwrite-unsafe' })
    // @ts-ignore
    second = await file.createSyncAccessHandle({ mode: 'readwrite-unsafe' })
    return true
  } catch {
    return false
  } finally {
    second?.close()
    first?.close()
    await root?.removeEntry(name).catch(() => {})
  }
}
