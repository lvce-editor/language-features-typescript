import { writeResult } from '../WriteResult/WriteResult.ts'
import * as SyncSetupState from '../SyncSetupState/SyncSetupState.ts'

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
  // @ts-ignore
  const accessHandle = await draftHandle.createSyncAccessHandle({
    mode: 'readwrite-unsafe',
  })
  // @ts-ignore
  const resultAccessHandle = await resultHandle.createSyncAccessHandle({
    mode: 'readwrite-unsafe',
  })
  // @ts-ignore
  const errorAccessHandle = await errorHandle.createSyncAccessHandle({
    mode: 'readwrite-unsafe',
  })

  SyncSetupState.set(id, {
    accessHandle,
    resultAccessHandle,
    errorAccessHandle,
    buffer,
  })
}

export const readFileSync = async (id, uri) => {
  const resultGenerator = () => {
    // @ts-ignore
    return vscode.readFile(uri)
  }
  await writeResult(id, resultGenerator)
}

export const readDirSync = async (id, uri) => {
  const resultGenerator = async () => {
    // @ts-ignore
    const result = await vscode.readDirWithFileTypes(uri)
    const baseNames = result.map((item) => item.name)
    return baseNames
  }
  await writeResult(id, resultGenerator)
}

export const exists = async (id, uri) => {
  const resultGenerator = async () => {
    try {
      // @ts-ignore
      const result = await vscode.exists(uri)
      return result
    } catch {
      return true
    }
  }
  await writeResult(id, resultGenerator)
}
