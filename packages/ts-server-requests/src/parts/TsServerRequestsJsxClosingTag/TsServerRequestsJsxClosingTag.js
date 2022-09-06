import * as Id from '../Id/Id.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'
import * as TsServerCommandType from '../TsServerCommandType/TsServerCommandType.js'
import { TsServerError } from '../TsServerError/TsServerError.js'

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').JsxClosingTagRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').JsxClosingTagResponse['body']|undefined>}
 */
export const jsxClosingTag = async (server, params) => {
  const message = await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.JsxClosingTag,
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    if (message.message === 'No content available.') {
      return undefined
    }
    throw new TsServerError(message, TsServerCommandType.JsxClosingTag)
  }
  return message.body
}
