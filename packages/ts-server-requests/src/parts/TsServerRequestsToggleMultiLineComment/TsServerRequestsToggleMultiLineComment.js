import * as Id from '../Id/Id.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'
import * as TsServerCommandType from '../TsServerCommandType/TsServerCommandType.js'
import { TsServerError } from '../TsServerError/TsServerError.js'

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').ToggleMultilineCommentRequest['arguments']} params
 */
export const toggleMultilineComment = async (server, params) => {
  const message = await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.ToggleMultilineComment,
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, TsServerCommandType.ToggleMultilineComment)
  }
  return message.body
}
