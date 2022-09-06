import * as TsServerCommandType from '../TsServerCommandType/TsServerCommandType.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').DefinitionRequest['arguments']} params
 */
export const definitionAndBoundSpan = (server, params) => {
  server.send({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.DefinitionAndBoundSpan,
    arguments: params,
  })
}
