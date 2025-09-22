interface SyncSetup {
  readonly accessHandle: FileSystemSyncAccessHandle
  readonly resultAccessHandle: FileSystemSyncAccessHandle
  readonly errorAccessHandle: FileSystemSyncAccessHandle
  readonly buffer: Int32Array<ArrayBufferLike>
}

const syncSetups = Object.create(null)

export const set = (id: number, setup: SyncSetup): void => {
  syncSetups[id] = setup
}

export const get = (id: number): SyncSetup => {
  return syncSetups[id]
}
