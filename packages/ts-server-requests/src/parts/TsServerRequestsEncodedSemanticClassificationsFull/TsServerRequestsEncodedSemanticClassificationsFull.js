import * as TsServerCommandType from '../TsServerCommandType/TsServerCommandType.js'
import { TsServerError } from '../TsServerError/TsServerError.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'
import * as Id from '../Id/Id.js'

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').EncodedSemanticClassificationsRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').EncodedSemanticClassificationsResponse['body']>}
 */
export const encodedSemanticClassificationsFull = async (server, params) => {
  const message = await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.EncodedSemanticClassificationsFull,
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(
      message,
      TsServerCommandType.EncodedSemanticClassificationsFull
    )
  }
  return message.body
}
