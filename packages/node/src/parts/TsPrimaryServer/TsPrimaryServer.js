import * as Assert from '../Assert/Assert.js'
import * as Callback from '../Callback/Callback.js'
import * as TsRpc from '../TsRpc/TsRpc.js'
import * as TsServer from '../TsServer/TsServer.js'
import * as TsServerLog from '../TsServerLog/TsServerLog.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'

export const state = {
  server: undefined,
  listeners: Object.create(null),
}

const getTsServerErrorMessage = (message) => {
  const lines = message.split('\n')
  if (lines.length === 1) {
    return message
  }
  const [shortDescription, actualError, ...stack] = lines
  let betterActualError = actualError
  if (betterActualError.startsWith('Error: ')) {
    betterActualError = betterActualError.slice(7)
  }
  let betterShortDescription = shortDescription
  if (betterShortDescription.endsWith(betterActualError)) {
    betterShortDescription = betterShortDescription.slice(0, -betterActualError.length)
  }
  if (betterShortDescription.endsWith('. ')) {
    betterShortDescription = betterShortDescription.slice(0, -2)
  }
}

const handleMessageEvent = (message) => {
  if (state.listeners[message.event]) {
    for (const listener of state.listeners[message.event]) {
      listener(message.body)
    }
  }
}

const handleMessage = (message) => {
  TsServerLog.receive(message)
  // console.log({ message })
  switch (message.type) {
    case TsServerMessageType.Response:
      return TsRpc.handleMessageResponse(message)
    case TsServerMessageType.Event:
      return handleMessageEvent(message)
    default:
      throw new Error(`unexpected message from tsserver: ${message.type}`)
  }
}

const handlePrimaryServerExit = (code) => {
  console.info(`[tsserver] exited with code ${code}`)
  if (!code) {
    return
  }
  // @ts-ignore
  Callback.rejectAll(new Error(`[tsserver] exited with code ${code}`))
}

const handlePrimaryServerError = (error) => {
  // @ts-ignore
  Callback.rejectAll(new Error(`[tsserver] encountered an error ${error}`))
}

export const start = async ({ ipc = 'node-ipc', tsServerPath = '', argv = [], execArgv = [] } = {}) => {
  // Assert._undefined(state.server)
  Assert.string(tsServerPath)
  const server = await TsServer.create({
    tsServerPath,
    argv,
    execArgv,
    handleError: handlePrimaryServerError,
    handleExit: handlePrimaryServerExit,
    handleMessage,
    ipc,
  })
  state.server = server
}

export const stop = () => {
  if (state.server) {
    state.server.dispose()
    state.server = undefined
  }
}

export const send = (message) => {
  if (!state.server) {
    throw new Error(`tsserver must be initialized before sending requests`)
  }
  state.server.send(message)
}

/**
 * @param {any} command
 * @param {any} params
 */
export const invoke = (command, params) => {
  const ipc = {
    send,
  }
  return TsRpc.invoke(ipc, command, params)
}
