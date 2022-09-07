import * as Assert from '../Assert/Assert.js'
import * as Callback from '../Callback/Callback.js'
import { TsServer, TsServerProcess } from '../TsServer/TsServer.js'
import * as TsServerIpcType from '../TsServerIpcType/TsServerIpcType.js'
import * as TsServerLog from '../TsServerLog/TsServerLog.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'

export const state = {
  server: undefined,
  listeners: Object.create(null),
  pendingRequests: Object.create(null),
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

export const start = ({ ipc = TsServerIpcType.NodeIpc, tsServerPath } = {}) => {
  // Assert._undefined(state.server) // TODO server should be undefined at this point
  Assert.string(tsServerPath)
  const tsServerArgs = []
  console.log({ tsServerPath, tsServerArgs })
  const child = TsServerProcess.create({
    tsServerPath,
    tsServerArgs,
  })
  const server = TsServer.create(child)

  state.server = server
}

export const stop = () => {
  if (state.server) {
    state.server.dispose()
    state.server = undefined
  }
}

export const send = (message) => {
  state.server.send(message)
}

/**
 * @param {any} message
 */
export const invoke = (message) => {
  TsServerLog.send(message)
  return state.server.invoke(message)
}

export const getInstance = () => {
  return state.server
}
