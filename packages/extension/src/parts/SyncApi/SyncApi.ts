import { exists as existsApi, readDirWithFileTypes, readFile } from '@lvce-editor/api'
import * as SyncSetupState from '../SyncSetupState/SyncSetupState.ts'
import { toFileUri } from '../ToFileUri/ToFileUri.ts'
import { writeResult } from '../WriteResult/WriteResult.ts'

export const syncSetup = async (
  id: number,
  buffer: Int32Array<ArrayBufferLike>,
  statusFileName: string,
  resultFileName: string,
  errorFileName: string,
  draftHandle: FileSystemFileHandle,
  resultHandle: FileSystemFileHandle,
  errorHandle: FileSystemFileHandle,
): Promise<void> => {
  const [accessHandle, resultAccessHandle, errorAccessHandle] = await Promise.all([
    // @ts-ignore
    draftHandle.createSyncAccessHandle({
      mode: 'readwrite-unsafe',
    }),
    // @ts-ignore
    resultHandle.createSyncAccessHandle({
      mode: 'readwrite-unsafe',
    }),
    // @ts-ignore
    errorHandle.createSyncAccessHandle({
      mode: 'readwrite-unsafe',
    }),
  ])

  SyncSetupState.set(id, {
    accessHandle,
    buffer,
    errorAccessHandle,
    resultAccessHandle,
  })
}

export const readFileSync = async (id: number, uri: string): Promise<void> => {
  const resultGenerator = () => {
    return readFile(toFileUri(uri))
  }
  await writeResult(id, resultGenerator)
}

export const readDirSync = async (id: number, uri: string): Promise<void> => {
  const resultGenerator = async () => {
    const result = await readDirWithFileTypes(toFileUri(uri))
    const baseNames = result.map((item) => item.name)
    return baseNames
  }
  await writeResult(id, resultGenerator)
}

export const exists = async (id: number, uri: string): Promise<void> => {
  const resultGenerator = async () => {
    try {
      const result = await existsApi(toFileUri(uri))
      return result
    } catch {
      return true
    }
  }
  await writeResult(id, resultGenerator)
}
