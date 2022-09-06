import * as TsServerCommandType from '../TsServerCommandType/TsServerCommandType.js'
import { TsServerError } from '../TsServerError/TsServerError.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').RenameRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').RenameResponseBody>}
 */
export const rename = async (server, params) => {
  const message = await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.Rename,
    arguments: params,
  })
  if (!message.success) {
    throw new TsServerError(message, TsServerCommandType.Rename)
  }
  return message.body
}
