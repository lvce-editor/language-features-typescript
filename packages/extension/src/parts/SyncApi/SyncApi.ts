import { writeResult } from '../WriteResult/WriteResult.js'
import * as SyncSetupState from '../SyncSetupState/SyncSetupState.js'

export const syncSetup = async (
  id: number,
  buffer: Int32Array<ArrayBufferLike>,
  statusFileName: string,
  resultFileName: string,
  errorFileName: string,
): Promise<void> => {
  const root = await navigator.storage.getDirectory()
  const draftHandle = await root.getFileHandle(statusFileName, { create: true })
  const resultHandle = await root.getFileHandle(resultFileName, { create: true })
  const errorHandle = await root.getFileHandle(errorFileName, { create: true })
  // TODO can use async handles here
  // @ts-ignore
  const accessHandle = await draftHandle.createSyncAccessHandle({
    keepExistingData: false,
  })
  // @ts-ignore
  const resultAccessHandle = await resultHandle.createSyncAccessHandle({
    keepExistingData: false,
  })
  // @ts-ignore
  const errorAccessHandle = await errorHandle.createSyncAccessHandle({
    keepExistingData: false,
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
