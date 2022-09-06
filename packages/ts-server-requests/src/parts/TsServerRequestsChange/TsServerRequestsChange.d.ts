import type { ChangeRequest } from 'typescript/lib/protocol'
import type { TsServer } from '../TsServer/TsServer.js'

export const change: (
  server: TsServer,
  params: ChangeRequest['arguments']
) => void
