import type {
  CompileOnSaveAffectedFileListRequest,
  CompileOnSaveAffectedFileListResponse,
} from 'typescript/lib/protocol'
import type { TsServer } from '../TsServer/TsServer.js'

export const compileOnSaveAffectedFileList: (
  server: TsServer,
  params: CompileOnSaveAffectedFileListRequest['arguments']
) => Promise<CompileOnSaveAffectedFileListResponse['body']>
