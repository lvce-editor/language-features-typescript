import type {
  DefinitionRequest,
  DefinitionResponse,
} from 'typescript/lib/protocol'
import type { TsServer } from '../TsServer/TsServer.js'

export const definition: (
  server: TsServer,
  params: DefinitionRequest['arguments']
) => Promise<DefinitionResponse['body']>
