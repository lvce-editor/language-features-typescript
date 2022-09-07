import type {
  CompletionDetailsRequest,
  CompletionDetailsResponse,
} from 'typescript/lib/protocol'
import type { TsServer } from '../TsServer/TsServer.js'

export const completionDetails: (
  server: TsServer,
  params: CompletionDetailsRequest['arguments']
) => Promise<CompletionDetailsResponse['body']>
