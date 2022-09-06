import * as Id from '../Id/Id.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'
import * as TsServerCommandType from '../TsServerCommandType/TsServerCommandType.js'
import { TsServerError } from '../TsServerError/TsServerError.js'

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').SemanticDiagnosticsSyncRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').SemanticDiagnosticsSyncResponse>}
 */
export const semanticDiagnosticsSync = async (server, params) => {
  const message = await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.SemanticDiagnosticsSync,
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(
      message,
      TsServerCommandType.SemanticDiagnosticsSync
    )
  }
  return message.body
}
