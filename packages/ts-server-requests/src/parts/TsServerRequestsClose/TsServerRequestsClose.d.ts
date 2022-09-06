import type { CloseRequest } from 'typescript/lib/protocol'

export interface TsServer {}

export const change: (
  server: TsServer,
  params: CloseRequest['arguments']
) => void
