import type {
  CompletionDetailsRequest,
  CompletionDetailsResponse,
} from 'typescript/lib/protocol'

export interface TsServer {}

export const completionDetails: (
  server: TsServer,
  params: CompletionDetailsRequest['arguments']
) => Promise<CompletionDetailsResponse>
