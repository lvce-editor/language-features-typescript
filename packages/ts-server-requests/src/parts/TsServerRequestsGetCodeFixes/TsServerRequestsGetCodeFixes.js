import * as TsServerCommandType from '../TsServerCommandType/TsServerCommandType.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').CodeFixRequest['arguments']} params
 */
export const getCodeFixes = async (server, params) => {
  await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.GetCodeFixes,
    arguments: params,
  })
}
