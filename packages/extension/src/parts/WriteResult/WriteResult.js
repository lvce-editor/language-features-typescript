import * as SyncSetupState from '../SyncSetupState/SyncSetupState.js'

const successCode = 123
const errorCode = 124

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

const notifyStatus = (buffer, accessHandle, statusCode) => {
  if (buffer) {
    Atomics.store(buffer, 0, statusCode)
    Atomics.notify(buffer, 0)
  } else {
    accessHandle.write(new Uint8Array([statusCode]), { at: 0 })
    accessHandle.flush()
  }
}

const writeJson = (handle, json) => {
  handle.write(new TextEncoder().encode(JSON.stringify(json)))
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
  notifyStatus(buffer, accessHandle, code)
}
