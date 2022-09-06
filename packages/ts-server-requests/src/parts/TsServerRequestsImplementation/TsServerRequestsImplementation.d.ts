import type {
  ImplementationRequest,
  ImplementationResponse,
} from 'typescript/lib/protocol'
import type { TsServer } from '../TsServer/TsServer.js'

export const implementation: (
  server: TsServer,
  params: ImplementationRequest['arguments']
) => Promise<ImplementationResponse['body']>
