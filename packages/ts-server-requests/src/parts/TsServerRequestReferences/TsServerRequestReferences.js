import * as TsServerCommandType from '../TsServerCommandType/TsServerCommandType.js'
import { TsServerError } from '../TsServerError/TsServerError.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').ReferencesRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').ReferencesResponseBody>}
 */
export const references = async (server, params) => {
  const message = await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.References,
    arguments: params,
  })
  if (!message.success) {
    throw new TsServerError(message, TsServerCommandType.References)
  }
  return message.body
}
