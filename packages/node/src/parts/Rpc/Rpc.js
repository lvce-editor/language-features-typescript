import * as Callback from '../Callback/Callback.js'
import * as GetErrorResponse from '../GetErrorResponse/GetErrorResponse.js'
import * as GetResponse from '../GetResponse/GetResponse.js'
import * as JsonRpc from '../JsonRpc/JsonRpc.js'
import { JsonRpcError } from '../JsonRpcError/JsonRpcError.js'

export const state = {
  /**
   * @type {any}
   */
  ipc: undefined,
}

export const send = (method, ...params) => {
  const { ipc } = state
  JsonRpc.send(ipc, method, ...params)
}

const handleMessageFromExtensionHostWorker = async (event) => {
  const message = event.data
  if ('id' in message) {
    if ('method' in message) {
      const response = await GetResponse.getResponse(message)
      try {
        state.ipc.send(response)
      } catch (error) {
        const errorResponse = GetErrorResponse.getErrorResponse(message, error)
        state.ipc.send(errorResponse)
      }
      return
    }
    Callback.resolve(message.id, message)
    return
  }
  console.log({ message })
  throw new JsonRpcError('unexpected message from renderer worker')
}

export const invoke = (method, ...params) => {
  return JsonRpc.invoke(state.ipc, method, ...params)
}

export const listen = (ipc) => {
  ipc.on('message', handleMessageFromExtensionHostWorker)
  state.ipc = ipc
}
