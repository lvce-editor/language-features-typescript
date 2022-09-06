import * as Id from '../Id/Id.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'
import * as TsServerCommandType from '../TsServerCommandType/TsServerCommandType.js'
import { TsServerError } from '../TsServerError/TsServerError.js'

/**
 * @param {any} server
 * @param {import('typescript/lib/protocol').TypeDefinitionRequest['arguments']} params
 * @returns {Promise<import('typescript/lib/protocol').TypeDefinitionResponse['body']>}
 */
export const typeDefinition = async (server, params) => {
  const message = await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.TypeDefinition,
    arguments: params,
    seq: Id.create(),
  })
  if (!message.success) {
    throw new TsServerError(message, TsServerCommandType.TypeDefinition)
  }
  return message.body
}
