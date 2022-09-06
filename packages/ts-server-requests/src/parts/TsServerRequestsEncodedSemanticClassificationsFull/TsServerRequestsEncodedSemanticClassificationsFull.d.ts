import type {
  EncodedSemanticClassificationsRequest,
  EncodedSemanticClassificationsResponse,
} from 'typescript/lib/protocol'
import type { TsServer } from '../TsServer/TsServer.js'

export const encodedSemanticClassificationsFull: (
  server: TsServer,
  params: EncodedSemanticClassificationsRequest['arguments']
) => Promise<EncodedSemanticClassificationsResponse['body']>
