import * as SyncSetupState from '../SyncSetupState/SyncSetupState.ts'

const successCode = 123
const errorCode = 123

const getResponse = async (resultGenerator) => {
  let _error
  let result
  try {
    result = await resultGenerator()
  } catch (error) {
    _error = error
  }

  const code = _error ? errorCode : successCode
  return {
    result,
    error: _error,
    code,
  }
}

const writeResultStatus = async (
  buffer: Int32Array<ArrayBufferLike>,
  accessHandle: FileSystemSyncAccessHandle,
  statusCode: number,
) => {
  if (buffer) {
    Atomics.store(buffer, 0, statusCode)
    Atomics.notify(buffer, 0)
  } else {
    await accessHandle.write(new Uint8Array([1, statusCode]))
  }
}

const writeBuffer = async (handle: FileSystemSyncAccessHandle, encoded: Uint8Array<ArrayBuffer>) => {
  handle.truncate(encoded.length)
  handle.write(encoded, { at: 0 })
  handle.flush()
}

const writeText = async (handle: FileSystemSyncAccessHandle, content: string): Promise<void> => {
  const encoded = new TextEncoder().encode(content)
  await writeBuffer(handle, encoded)
}

const writeJson = async (handle: FileSystemSyncAccessHandle, json: any): Promise<void> => {
  const content = JSON.stringify(json)
  await writeText(handle, content)
}

const writeResultError = async (errorAccessHandle: FileSystemSyncAccessHandle, error: any) => {
  if (!error) {
    return
  }
  await writeJson(errorAccessHandle, {
    // @ts-ignore
    name: error.name,
    // @ts-ignore
    message: error.message,
    // @ts-ignore
    stack: error.stack,
  })
}

const writeResultContent = async (resultAccessHandle: FileSystemSyncAccessHandle, result: any, error: any) => {
  if (error) {
    return
  }
  await writeJson(resultAccessHandle, result)
}

export const writeResult = async (id: any, resultGenerator: () => Promise<any>) => {
  const { accessHandle, resultAccessHandle, errorAccessHandle, buffer } = SyncSetupState.get(id)
  const { result, error, code } = await getResponse(resultGenerator)
  await writeResultError(errorAccessHandle, error)
  await writeResultContent(resultAccessHandle, result, error)
  await writeResultStatus(buffer, accessHandle, code)
}
