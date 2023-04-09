import * as Assert from '../Assert/Assert.js'
import * as Callback from '../Callback/Callback.js'
import * as TsServer from '../TsServer/TsServer.js'
import * as TsServerLog from '../TsServerLog/TsServerLog.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'
import * as Logger from '../Logger/Logger.js'

export const state = {
  server: undefined,
  listeners: Object.create(null),
  pendingRequests: Object.create(null),
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
    betterShortDescription = betterShortDescription.slice(
      0,
      -betterActualError.length
    )
  }
  if (betterShortDescription.endsWith('. ')) {
    betterShortDescription = betterShortDescription.slice(0, -2)
  }
}

const handleMessageResponse = (message) => {
  const seq = message.seq
  Assert.number(seq)
  const pendingRequest = state.pendingRequests[seq]
  console.log({ message })
  if (!pendingRequest) {
    Logger.warn(
      `no matching request found for request with sequence number ${seq}`
    )
    return
  }
  pendingRequest.resolve(message)
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
      return handleMessageResponse(message)
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

export const start = async ({ ipc = 'node-ipc', tsServerPath } = {}) => {
  // Assert._undefined(state.server)
  Assert.string(tsServerPath)
  const server = await TsServer.create({
    tsServerPath,
    handleError: handlePrimaryServerError,
    handleExit: handlePrimaryServerExit,
    handleMessage,
    ipc,
  })
  console.log({ server })
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
 * @param {any} message
 */
export const invoke = (message) => {
  Assert.string(message.command)
  Assert.number(message.seq)
  TsServerLog.send(message)
  console.log('invoke', message)
  return new Promise((resolve, reject) => {
    state.pendingRequests[message.seq] = {
      resolve,
      reject,
      command: message.command,
    }
    send(message)
  })
}
