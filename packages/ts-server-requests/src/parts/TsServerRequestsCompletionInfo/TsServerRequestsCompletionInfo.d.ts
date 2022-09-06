import type {
  CompletionsRequest,
  CompletionInfoResponse,
} from 'typescript/lib/protocol'
import type { TsServer } from '../TsServer/TsServer.js'

export const completionInfo: (
  server: TsServer,
  params: CompletionsRequest['arguments']
) => Promise<CompletionInfoResponse['body']>
