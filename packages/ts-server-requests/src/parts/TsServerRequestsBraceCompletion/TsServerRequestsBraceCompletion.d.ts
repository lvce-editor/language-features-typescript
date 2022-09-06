import type { BraceCompletionRequest } from 'typescript/lib/protocol'
import type { TsServer } from '../TsServer/TsServer.js'

export const braceCompletion: (
  server: TsServer,
  params: BraceCompletionRequest['arguments']
) => Promise<unknown>
