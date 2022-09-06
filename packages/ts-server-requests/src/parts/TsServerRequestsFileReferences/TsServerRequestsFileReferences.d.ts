import type {
  FileReferencesRequest,
  FileReferencesResponse,
} from 'typescript/lib/protocol'
import type { TsServer } from '../TsServer/TsServer.js'

export const fileReferences: (
  server: TsServer,
  params: FileReferencesRequest['arguments']
) => Promise<FileReferencesResponse['body']>
