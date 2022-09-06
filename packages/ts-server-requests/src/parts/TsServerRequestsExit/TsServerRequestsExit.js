import * as TsServerCommandType from '../TsServerCommandType/TsServerCommandType.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'

/**
 * @param {any} server
 */
export const exit = async (server) => {
  await server.invoke({
    type: TsServerMessageType.Request,
    command: TsServerCommandType.Exit,
  })
}
