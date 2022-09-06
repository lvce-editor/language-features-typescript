import type { CloseRequest } from 'typescript/lib/protocol'
import type { TsServer } from '../TsServer/TsServer.js'

export const close: (
  server: TsServer,
  params: CloseRequest['arguments']
) => void
