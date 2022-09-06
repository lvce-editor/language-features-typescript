import * as TsServerCommandType from '../TsServerCommandType/TsServerCommandType.js'
import { TsServerError } from '../TsServerError/TsServerError.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').CompletionDetailsRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').CompletionDetailsResponse>}
 */
export const completionDetails = async (server, params) => {
  const message = await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.CompletionEntryDetails,
    arguments: params,
  })
  if (!message.success) {
    throw new TsServerError(message, TsServerCommandType.CompletionEntryDetails)
  }
  return message.body
}
