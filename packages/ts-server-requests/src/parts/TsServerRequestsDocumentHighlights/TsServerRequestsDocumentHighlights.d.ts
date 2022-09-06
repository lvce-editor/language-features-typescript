import type {
  DocumentHighlightsRequest,
  DocumentHighlightsResponse,
} from 'typescript/lib/protocol'
import type { TsServer } from '../TsServer/TsServer.js'

export const documentHighlights: (
  server: TsServer,
  params: DocumentHighlightsRequest['arguments']
) => Promise<DocumentHighlightsResponse['body']>
