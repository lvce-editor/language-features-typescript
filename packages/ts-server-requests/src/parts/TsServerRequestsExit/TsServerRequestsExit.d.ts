import type { ExitRequest } from 'typescript/lib/protocol'
import type { TsServer } from '../TsServer/TsServer.js'

export const exit: (
  server: TsServer,
  params: ExitRequest['arguments']
) => Promise<void>
