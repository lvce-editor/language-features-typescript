import * as Rpc from '../Rpc/Rpc.js'
import * as SyncApi from '../SyncApi/SyncApi.js'

const rpcInvoke = (...params) => {
  return Rpc.invoke(...params)
}

const rpcListen = (path) => {}

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

export const commandMap = {
  'TypeScriptRpc.invoke': rpcInvoke,
  'Completion.getCompletion': rpcInvoke,
  'ResolveCompletion.resolveCompletion': rpcInvoke,
  'TypeScriptRpc.listen': rpcListen,
  'Position.getOffset': getOffset,
  'Position.getPosition': getPosition,
  'FileSystem.readFile': readFile,
  'FileSystem.readDir': readDir,
  'SyncApi.readFileSync': SyncApi.readFileSync,
  'SyncApi.readDirSync': SyncApi.readDirSync,
  'SyncApi.setup': SyncApi.syncSetup,
  'SyncApi.exists': SyncApi.exists,
}
