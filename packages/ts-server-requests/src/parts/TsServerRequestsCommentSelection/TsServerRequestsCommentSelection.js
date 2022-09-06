import * as Id from '../Id/Id.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'
import * as TsServerCommandType from '../TsServerCommandType/TsServerCommandType.js'
import { TsServerError } from '../TsServerError/TsServerError.js'

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').CommentSelectionRequest['arguments']} params
 * @returns {Promise<unknown>}
 */
export const commentSelection = async (server, params) => {
  const message = await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.CommentSelection,
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, TsServerCommandType.CommentSelection)
  }
  return message.body
}
