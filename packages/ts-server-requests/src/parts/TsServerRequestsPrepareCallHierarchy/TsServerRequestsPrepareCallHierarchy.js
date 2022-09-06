import * as TsServerCommandType from '../TsServerCommandType/TsServerCommandType.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').PrepareCallHierarchyRequest['arguments']} params
 */
export const prepareCallHierarchy = async (server, params) => {
  await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.PrepareCallHierarchy,
    arguments: params,
  })
}