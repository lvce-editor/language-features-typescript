import * as TsServerCommandType from '../TsServerCommandType/TsServerCommandType.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').GetSupportedCodeFixesRequest['arguments']} params
 */
export const getSupportedCodeFixes = async (server, params) => {
  await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.GetSupportedCodeFixes,
    arguments: params,
  })
}
