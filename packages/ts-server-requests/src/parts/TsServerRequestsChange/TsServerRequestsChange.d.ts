import type { ChangeRequest } from 'typescript/lib/protocol'

export interface TsServer {}

export const change: (
  server: TsServer,
  params: ChangeRequest['arguments']
) => void
