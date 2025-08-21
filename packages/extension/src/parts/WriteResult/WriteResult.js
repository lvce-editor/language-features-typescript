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

const writeResultStatus = (buffer, accessHandle, statusCode) => {
  console.log({ buffer, statusCode })
  if (buffer) {
    Atomics.store(buffer, 0, statusCode)
    Atomics.notify(buffer, 0)
  } else {
    accessHandle.write(new Uint8Array([1, statusCode]), { at: 0 })
    accessHandle.flush()
  }
}

const writeResultError = (errorAccessHandle, error) => {
  if (!error) {
    return
  }
  errorAccessHandle.write(
    new TextEncoder().encode(
      JSON.stringify({
        // @ts-ignore
        name: error.name,
        // @ts-ignore
        message: error.message,
        // @ts-ignore
        stack: error.stack,
      }),
    ),
  )
}

const writeResultContent = (resultAccessHandle, result, error) => {
  if (error) {
    return
  }
  resultAccessHandle.write(new TextEncoder().encode(JSON.stringify(result)), {
    at: 0,
  })
}

export const writeResult = async (id, resultGenerator) => {
  const { accessHandle, resultAccessHandle, errorAccessHandle, buffer } = SyncSetupState.get(id)
  const { result, error, code } = await getResponse(resultGenerator)
  writeResultError(errorAccessHandle, error)
  writeResultContent(resultAccessHandle, result, error)
  writeResultStatus(buffer, accessHandle, code)
}
