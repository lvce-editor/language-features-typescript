import * as Rpc from '../Rpc/Rpc.js'

const rpcInvoke = (...params) => {
  return Rpc.invoke(...params)
}

const rpcListen = (path) => {
  return Rpc.listen({ path })
}

const getOffset = (textDocument, position) => {
  // @ts-ignore
  return vscode.getOffset(textDocument, position)
}

const getPosition = (textDocument, offset) => {
  // @ts-ignore
  return vscode.getPosition(textDocument, offset)
}

const readFile = (uri) => {
  // @ts-ignore
  return vscode.readFile(uri)
}

const readDir = (uri) => {
  // @ts-ignore
  return vscode.readDirWithFileTypes(uri)
}

const syncSetups = Object.create(null)

const syncSetup = async (id) => {
  const root = await navigator.storage.getDirectory()
  const draftHandle = await root.getFileHandle('draft.txt', { create: true })
  const resultHandle = await root.getFileHandle('result.txt', { create: true })
  // TODO can use async handles here
  const accessHandle = await draftHandle.createSyncAccessHandle({
    mode: 'readwrite-unsafe',
  })
  const resultAccessHandle = await resultHandle.createSyncAccessHandle({
    mode: 'readwrite-unsafe',
  })
  syncSetups[id] = {
    accessHandle,
    resultAccessHandle,
  }
}

const readFileSync = async (id, uri, resultPath) => {
  const { accessHandle, resultAccessHandle } = syncSetups[id]
  const result = await vscode.readFile(uri)
  // resultAccessHandle.truncate(0)
  resultAccessHandle.write(new TextEncoder().encode(JSON.stringify(result)), {
    at: 0,
  })
  accessHandle.write(new Uint8Array([1, 2, 3]), { at: 0 })
  accessHandle.flush()
}

const getFn = (method) => {
  switch (method) {
    case 'TypeScriptRpc.invoke':
    case 'Completion.getCompletion':
    case 'ResolveCompletion.resolveCompletion':
      return rpcInvoke
    case 'TypeScriptRpc.listen':
      return rpcListen
    case 'Position.getOffset':
      return getOffset
    case 'Position.getPosition':
      return getPosition
    case 'FileSystem.readFile':
      return readFile
    case 'FileSystem.readDir':
      return readDir
    case 'SyncApi.readFileSync':
      return readFileSync
    case 'SyncApi.setup':
      return syncSetup
    default:
      throw new Error('method not found')
  }
}

export const execute = (method, ...params) => {
  const fn = getFn(method)
  return fn(...params)
}
