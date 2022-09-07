import * as TsServerCommandType from '../TsServerCommandType/TsServerCommandType.js'
import { TsServerError } from '../TsServerError/TsServerError.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'
import * as Id from '../Id/Id.js'

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').ConfigureRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').ConfigureResponse>}
 */
export const configure = async (server, params) => {
  const message = await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.Configure,
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, TsServerCommandType.Configure)
  }
  return message.body
}
