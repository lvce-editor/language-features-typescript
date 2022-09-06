import * as TsServerCommandType from '../TsServerCommandType/TsServerCommandType.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').OutliningSpansRequest['arguments']} params
 */
export const getOutliningSpans = async (server, params) => {
  await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.GetOutliningSpans,
    arguments: params,
  })
}
