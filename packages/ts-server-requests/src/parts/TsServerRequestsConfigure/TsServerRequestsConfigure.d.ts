import type {
  ConfigureRequest,
  ConfigureResponse,
} from 'typescript/lib/protocol'
import type { TsServer } from '../TsServer/TsServer.js'

export const configure: (
  server: TsServer,
  params: ConfigureRequest['arguments']
) => Promise<ConfigureResponse['body']>
