import { readDirWithFileTypes, readFile as readFileApi } from '@lvce-editor/api'
import * as Rpc from '../Rpc/Rpc.ts'
import * as SyncApi from '../SyncApi/SyncApi.ts'
import * as TextDocument from '../TextDocument/TextDocument.ts'

const rpcInvoke = (method: string, ...params: any[]): any => {
  return Rpc.invoke(method, ...params)
}

const rpcListen = (path: any): void => {}

const getOffset = (textDocument: any, position: any): any => {
  return TextDocument.getOffset(textDocument, position)
}

const getPosition = (textDocument: any, offset: any): any => {
  return TextDocument.getPosition(textDocument, offset)
}

const readFile = (uri: any): any => {
  return readFileApi(uri)
}

const readDir = (uri: any): any => {
  return readDirWithFileTypes(uri)
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
