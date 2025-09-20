import * as SyncSetupState from '../SyncSetupState/SyncSetupState.js'

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

const writeResultStatus = (buffer, accessHandle, statusCode) => {
  if (buffer) {
    console.log('write status', statusCode)
    Atomics.store(buffer, 0, statusCode)
    Atomics.notify(buffer, 0)
  } else {
    accessHandle.write(new Uint8Array([1, statusCode]), { at: 0 })
    accessHandle.flush()
  }
}

/**
 *
 * @param {FileSystemSyncAccessHandle} handle
 * @param {Uint8Array<ArrayBuffer>} encoded
 */
const writeBuffer = (handle, encoded) => {
  handle.write(encoded, { at: 0 })
}

/**
 *
 * @param {FileSystemSyncAccessHandle} handle
 * @param {string} content
 */
const writeText = (handle, content) => {
  const encoded = new TextEncoder().encode(content)
  writeBuffer(handle, encoded)
}

/**
 *
 * @param {FileSystemSyncAccessHandle} handle
 * @param {*} json
 */
const writeJson = (handle, json) => {
  const content = JSON.stringify(json)
  writeText(handle, content)
}

const writeResultError = (errorAccessHandle, error) => {
  if (!error) {
    return
  }
  writeJson(errorAccessHandle, {
    // @ts-ignore
    name: error.name,
    // @ts-ignore
    message: error.message,
    // @ts-ignore
    stack: error.stack,
  })
}

const writeResultContent = (resultAccessHandle, result, error) => {
  if (error) {
    return
  }
  writeJson(resultAccessHandle, result)
}

export const writeResult = async (id, resultGenerator) => {
  const { accessHandle, resultAccessHandle, errorAccessHandle, buffer } = SyncSetupState.get(id)
  const { result, error, code } = await getResponse(resultGenerator)
  writeResultError(errorAccessHandle, error)
  writeResultContent(resultAccessHandle, result, error)
  writeResultStatus(buffer, accessHandle, code)
}
