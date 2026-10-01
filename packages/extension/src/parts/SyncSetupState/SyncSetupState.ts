import type { SharedSetup } from '../WriteSharedResult/WriteSharedResult.ts'

interface SyncSetup {
  readonly accessHandle: FileSystemSyncAccessHandle
  readonly buffer: Int32Array<ArrayBufferLike>
  readonly errorAccessHandle: FileSystemSyncAccessHandle
  readonly resultAccessHandle: FileSystemSyncAccessHandle
}

const syncSetups = Object.create(null)

export const set = (id: number, setup: SyncSetup | SharedSetup): void => {
  syncSetups[id] = setup
}

export const get = (id: number): SyncSetup | SharedSetup => {
  return syncSetups[id]
}
