import * as TsServerMessageType from '../TsServerMessageType/TsServerMessageType.js'

export const create = (tsServerProcess) => {
  const state = {
    pendingRequests: Object.create(null),
  }
  const handleMessage = (message) => {
    console.log({ message })
    switch (message.type) {
      case TsServerMessageType.Response:
        const pendingRequest = state.pendingRequests[message.request_seq]
        pendingRequest.resolve(message)
        break
      case TsServerMessageType.Event:
        // if (state.listeners[message.event]) {
        //   for (const listener of state.listeners[message.event]) {
        //     listener(message.body)
        //   }
        // }
        break
      // TODO handle error
      default:
        break
    }
  }
  tsServerProcess.onMessage(handleMessage)
  return {
    invoke(message) {
      return new Promise((resolve, reject) => {
        state.pendingRequests[message.seq] = {
          resolve,
          reject,
          command: message.command,
        }
        tsServerProcess.send(message)
      })
    },
    dispose() {
      tsServerProcess.dispose()
    },
  }
}
