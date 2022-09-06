import * as Id from '../Id/Id.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'
import * as TsServerCommandType from '../TsServerCommandType/TsServerCommandType.js'
import { TsServerError } from '../TsServerError/TsServerError.js'

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').ProvideCallHierarchyIncomingCallsRequest['arguments']} params
 */
export const provideCallHierarchyIncomingCalls = async (server, params) => {
  await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.ProvideCallHierarchyIncomingCalls,
    arguments: params,
  })
}
