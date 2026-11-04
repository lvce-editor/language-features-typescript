import { getWorkspaceUri, readDirWithFileTypes, readFile as readFileApi, stat } from '@lvce-editor/api'
import * as DiskWatch from '../DiskWatch/DiskWatch.ts'
import * as DocumentLifecycle from '../DocumentLifecycle/DocumentLifecycle.ts'
import * as FileCacheApi from '../FileCacheApi/FileCacheApi.ts'
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
  'DocumentLifecycle.getOpenUris': DocumentLifecycle.getOpenUris,
  'FileCache.getHandle': FileCacheApi.getHandle,
  'FileCache.getHashes': FileCacheApi.getHashes,
  'FileCache.getValidation': FileCacheApi.getValidation,
  'FileCache.getWatchState': DiskWatch.getWatchState,
  'FileCache.startWatching': DiskWatch.startWatching,
  'FileCache.stopWatching': DiskWatch.stopWatching,
  'FileSystem.exists': async (uri: string) => {
    try {
      await stat(toFileUri(uri))
      return true
    } catch {
      return false
    }
  },
  'FileSystem.getWorkspaceUri': getWorkspaceUri,
  'FileSystem.readDir': readDir,
  'FileSystem.readFile': readFile,
  'Position.getOffset': getOffset,
  'Position.getPosition': getPosition,
  'ResolveCompletion.resolveCompletion': rpcInvoke,
  'SyncApi.dispose': SyncApi.dispose,
  'SyncApi.exists': SyncApi.exists,
  'SyncApi.getDirectoriesSync': SyncApi.getDirectoriesSync,
  'SyncApi.getWorkspaceUri': SyncApi.getWorkspaceUri,
  'SyncApi.readDirectoryEntries': SyncApi.readDirectoryEntries,
  'SyncApi.readDirSync': SyncApi.readDirSync,
  'SyncApi.readFileOptional': SyncApi.readFileOptional,
  'SyncApi.readFileSync': SyncApi.readFileSync,
  'SyncApi.setup': SyncApi.syncSetup,
  'SyncApi.setupShared': SyncApi.syncSetupShared,
  'TypeScriptRpc.invoke': rpcInvoke,
  'TypeScriptRpc.listen': rpcListen,
}
