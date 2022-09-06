import * as TsServerCommandType from '../TsServerCommandType/TsServerCommandType.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').CloseExternalProjectRequest['arguments']} params
 */
export const closeExternalProject = (server, params) => {
  server.send({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.CloseExternalProject,
    arguments: params,
  })
}
