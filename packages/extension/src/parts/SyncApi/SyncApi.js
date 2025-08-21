const syncSetups = Object.create(null)

export const syncSetup = async (id, buffer, statusFileName, resultFileName, errorFileName) => {
  const root = await navigator.storage.getDirectory()
  const draftHandle = await root.getFileHandle(statusFileName, { create: true })
  const resultHandle = await root.getFileHandle(resultFileName, { create: true })
  const errorHandle = await root.getFileHandle(errorFileName, { create: true })
  // TODO can use async handles here
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
  syncSetups[id] = {
    accessHandle,
    resultAccessHandle,
    errorAccessHandle,
    buffer,
  }
}

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

const writeResult = async (id, resultGenerator) => {
  const { accessHandle, resultAccessHandle, errorAccessHandle, buffer } = syncSetups[id]
  const { result, error } = await getResponse(resultGenerator)
  writeResultError(errorAccessHandle, error)
  writeResultContent(resultAccessHandle, result, error)
  notifyStatus(buffer, accessHandle, error)
}

export const readFileSync = async (id, uri, resultPath) => {
  // @ts-ignore
  const result = await vscode.readFile(uri)
  await writeResult(id, result)
}

export const readDirSync = async (id, uri, resultPath) => {
  // @ts-ignore
  const result = await vscode.readDirWithFileTypes(uri)
  const baseNames = result.map((item) => item.name)
  await writeResult(id, baseNames)
}

export const exists = async (id, uri, resultPath) => {
  try {
    // @ts-ignore
    const result = await vscode.exists(uri)
    await writeResult(id, result)
  } catch {
    await writeResult(id, true)
  }
}
