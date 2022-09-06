import type { BraceCompletionRequest } from 'typescript/lib/protocol'

export interface TsServer {}

export const braceCompletion: (
  server: TsServer,
  params: BraceCompletionRequest['arguments']
) => Promise<unknown>
