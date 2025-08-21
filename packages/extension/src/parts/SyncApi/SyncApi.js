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

export const readFileSync = async (id, uri, resultPath) => {
  const { accessHandle, resultAccessHandle, buffer } = syncSetups[id]
  // @ts-ignore
  const result = await vscode.readFile(uri)
  // TODO write text to file
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
