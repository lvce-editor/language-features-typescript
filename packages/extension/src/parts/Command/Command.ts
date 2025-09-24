import * as Rpc from '../Rpc/Rpc.ts'
import * as SyncApi from '../SyncApi/SyncApi.ts'

const rpcInvoke = (method: string, ...params: any[]): any => {
  return Rpc.invoke(method, ...params)
}

const rpcListen = (path: any): void => {}

const getOffset = (textDocument: any, position: any): any => {
  // @ts-ignore
  return vscode.getOffset(textDocument, position)
}

const getPosition = (textDocument: any, offset: any): any => {
  // @ts-ignore
  return vscode.getPosition(textDocument, offset)
}

const readFile = (uri: any): any => {
  // @ts-ignore
  return vscode.readFile(uri)
}

const readDir = (uri: any): any => {
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
