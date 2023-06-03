import * as Assert from '../Assert/Assert.js'
import * as Id from '../Id/Id.js'
import * as Logger from '../Logger/Logger.js'
import { TsServerError } from '../TsServerError/TsServerError.js'
import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'

export const state = {
  pendingRequests: Object.create(null),
}

export const invoke = async (ipc, command, params) => {
  // TsServerLog.send(message)
  const seq = Id.create()
  const request = {
    type: TsServerMessageType.Request,
    command,
    arguments: params,
    seq,
  }
  const response = await new Promise((resolve, reject) => {
    state.pendingRequests[seq] = {
      resolve,
      reject,
      command,
    }
    ipc.send(request)
  })
  if (!response.success) {
    throw new TsServerError(response, command)
  }
  return response.body
}

export const handleMessageResponse = (message) => {
  const request_seq = message.request_seq
  Assert.number(request_seq)
  const pendingRequest = state.pendingRequests[request_seq]
  if (!pendingRequest) {
    Logger.warn(
      `no matching request found for request with sequence number ${request_seq}`
    )
    return
  }
  delete state.pendingRequests[request_seq]
  pendingRequest.resolve(message)
}
