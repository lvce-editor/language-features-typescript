import * as TsServerCommandType from '../TsServerCommandType/TsServerCommandType.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').SpanOfEnclosingCommentRequest['arguments']} params
 */
export const getSpanOfEnclosingComment = async (server, params) => {
  await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.GetSpanOfEnclosingComment,
    arguments: params,
  })
}
