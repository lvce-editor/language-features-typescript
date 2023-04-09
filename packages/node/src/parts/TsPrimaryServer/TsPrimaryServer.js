import * as Assert from '../Assert/Assert.js'
import * as Callback from '../Callback/Callback.js'
import * as TsServer from '../TsServer/TsServer.js'
import * as TsServerLog from '../TsServerLog/TsServerLog.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'

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

const handleMessage = (message) => {
  TsServerLog.receive(message)
  // console.log({ message })
  switch (message.type) {
    case TsServerMessageType.Response:
      const pendingRequest = state.pendingRequests[message.request_seq]
      pendingRequest.resolve(message)
      // if (message.success) {
      //   pendingRequest.resolve(message.body)
      // } else {
      //   pendingRequest.reject(
      //     new TsServerError(message.message, pendingRequest.command)
      //   )
      // }
      break
    case TsServerMessageType.Event:
      if (state.listeners[message.event]) {
        for (const listener of state.listeners[message.event]) {
          listener(message.body)
        }
      }
      break
    // TODO handle error
    default:
      break
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
  TsServerLog.send(message)
  return new Promise((resolve, reject) => {
    state.pendingRequests[message.seq] = {
      resolve,
      reject,
      command: message.command,
    }
    send(message)
  })
}
