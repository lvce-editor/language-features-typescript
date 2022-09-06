import * as Id from '../Id/Id.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'
import * as TsServerCommandType from '../TsServerCommandType/TsServerCommandType.js'
import { TsServerError } from '../TsServerError/TsServerError.js'

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').ChangeRequest['arguments']} params
 */
export const change = (server, params) => {
  server.send({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.Change,
    arguments: params,
  })
}
