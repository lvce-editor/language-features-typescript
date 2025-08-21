const syncSetups = Object.create(null)

export const syncSetup = async (id, buffer) => {
  const root = await navigator.storage.getDirectory()
  const draftHandle = await root.getFileHandle('draft.txt', { create: true })
  const resultHandle = await root.getFileHandle('result.txt', { create: true })
  // TODO can use async handles here
  // @ts-ignore
  const accessHandle = await draftHandle.createSyncAccessHandle({
    mode: 'readwrite-unsafe',
  })
  // @ts-ignore
  const resultAccessHandle = await resultHandle.createSyncAccessHandle({
    mode: 'readwrite-unsafe',
  })
  syncSetups[id] = {
    accessHandle,
    resultAccessHandle,
    buffer,
  }
}

const writeResult = async (id, result) => {
  const { accessHandle, resultAccessHandle, buffer } = syncSetups[id]
  resultAccessHandle.write(new TextEncoder().encode(JSON.stringify(result)), {
    at: 0,
  })
  if (buffer) {
    Atomics.store(buffer, 0, 123)
    Atomics.notify(buffer, 0)
  } else {
    accessHandle.write(new Uint8Array([1, 2, 3]), { at: 0 })
    accessHandle.flush()
  }
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
