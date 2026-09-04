interface SyncSetup {
  readonly accessHandle: FileSystemSyncAccessHandle
  readonly buffer: Int32Array<ArrayBufferLike>
  readonly errorAccessHandle: FileSystemSyncAccessHandle
  readonly resultAccessHandle: FileSystemSyncAccessHandle
}

const syncSetups = Object.create(null)

export const set = (id: number, setup: SyncSetup): void => {
  syncSetups[id] = setup
}

export const get = (id: number): SyncSetup => {
  return syncSetups[id]
}
