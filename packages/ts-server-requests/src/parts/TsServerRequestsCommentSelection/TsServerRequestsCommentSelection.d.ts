import type { CommentSelectionRequest } from 'typescript/lib/protocol'
import type { TsServer } from '../TsServer/TsServer.js'

export const commentSelection: (
  server: TsServer,
  params: CommentSelectionRequest['arguments']
) => Promise<unknown>
