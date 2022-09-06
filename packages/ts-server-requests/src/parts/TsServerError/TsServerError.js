// for reference, see https://github.com/Microsoft/TypeScript/blob/main/lib/protocol.d.ts#L5

import VError from 'verror'
import * as Id from '../Id/Id.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'
import * as TsServerCommandType from '../TsServerCommandType/TsServerCommandType.js'

// TODO somehow tsserver stack is not printed
export class TsServerError extends VError {
  // @ts-ignore
  constructor(message, command) {
    // console.log({ message })
    const actualMessage = message.message || ''
    const lines = actualMessage.split('\n')
    if (lines.length === 1) {
      super(`TsServer.${command} failed to execute: ${actualMessage}`)
      return
    }
    const [shortDescription, actualError, ...stack] = lines
    let betterActualError = actualError
    if (betterActualError.startsWith('Error: ')) {
      betterActualError = betterActualError.slice(7)
    }
    let betterShortDescription = `TsServer.${command} failed to execute`
    const tsError = new Error(betterActualError)
    tsError.stack = [shortDescription, actualError, ...stack].join('\n')
    // @ts-ignore
    super(tsError, betterShortDescription)
  }
}
