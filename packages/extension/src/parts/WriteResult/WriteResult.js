const getResponse = async (resultGenerator) => {
  let _error
  let result
  try {
    result = await resultGenerator()
  } catch (error) {
    _error = error
  }
  return {
    result,
    error: _error,
  }
}

const notifyStatus = (buffer, accessHandle, error) => {
  const successCode = 123
  const errorCode = 124
  const code = error ? errorCode : successCode
  if (buffer) {
    Atomics.store(buffer, 0, code)
    Atomics.notify(buffer, 0)
  } else {
    accessHandle.write(new Uint8Array([code]), { at: 0 })
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
  const { accessHandle, resultAccessHandle, errorAccessHandle, buffer } = syncSetups[id]
  const { result, error } = await getResponse(resultGenerator)
  writeResultError(errorAccessHandle, error)
  writeResultContent(resultAccessHandle, result, error)
  notifyStatus(buffer, accessHandle, error)
}
