import * as TsServerCommandType from '../TsServerCommandType/TsServerCommandType.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').CloseRequest['arguments']} params
 */
export const close = (server, params) => {
  server.send({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.Close,
    arguments: params,
  })
}
