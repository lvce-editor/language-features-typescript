import { readDirWithFileTypes, readFile as readFileApi } from '@lvce-editor/api'
import * as Rpc from '../Rpc/Rpc.ts'
import * as SyncApi from '../SyncApi/SyncApi.ts'
import * as TextDocument from '../TextDocument/TextDocument.ts'
import { toFileUri } from '../ToFileUri/ToFileUri.ts'

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
  return readFileApi(toFileUri(uri))
}

const readDir = (uri: any): any => {
  return readDirWithFileTypes(toFileUri(uri))
}

export const commandMap = {
  'Completion.getCompletion': rpcInvoke,
  'FileSystem.readDir': readDir,
  'FileSystem.readFile': readFile,
  'Position.getOffset': getOffset,
  'Position.getPosition': getPosition,
  'ResolveCompletion.resolveCompletion': rpcInvoke,
  'SyncApi.exists': SyncApi.exists,
  'SyncApi.readDirSync': SyncApi.readDirSync,
  'SyncApi.readFileSync': SyncApi.readFileSync,
  'SyncApi.setup': SyncApi.syncSetup,
  'TypeScriptRpc.invoke': rpcInvoke,
  'TypeScriptRpc.listen': rpcListen,
}
