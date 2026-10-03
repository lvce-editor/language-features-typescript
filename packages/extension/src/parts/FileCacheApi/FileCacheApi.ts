import { getCacheFileHandle, getFileHashes } from '@lvce-editor/api'
import { toFileUri } from '../ToFileUri/ToFileUri.ts'
import { writeResult } from '../WriteResult/WriteResult.ts'

export const getHandle = (name: string): Promise<FileSystemFileHandle> => getCacheFileHandle(name)

export const getHashes = async (id: number, uris: readonly string[]): Promise<void> => {
  await writeResult(id, () => getFileHashes(uris.map(toFileUri)))
}
