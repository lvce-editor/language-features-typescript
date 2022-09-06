import type { UpdateOpenRequest } from 'typescript/lib/protocol'
import type { TsServer } from '../TsServer/TsServer.js'

export const updateOpen: (
  server: TsServer,
  params: UpdateOpenRequest['arguments']
) => Promise<void>
