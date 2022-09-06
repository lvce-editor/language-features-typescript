import type { CloseExternalProjectRequest } from 'typescript/lib/protocol'
import type { TsServer } from '../TsServer/TsServer.js'

export const closeExternalProject: (
  server: TsServer,
  params: CloseExternalProjectRequest['arguments']
) => void
