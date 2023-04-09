import * as FirstNodeProcessEventType from '../FirstNodeProcessEventType/FirstNodeProcessEventType.js'

export const getFirstNodeProcessEvent = async (process) => {
  const { type, event } = await new Promise((resolve) => {
    const cleanup = (value) => {
      process.off('disconnect', handleDisconnect)
      process.off('error', handleError)
      process.off('message', handleMessage)
      process.off('exit', handleExit)
      resolve(value)
    }

    const handleDisconnect = (event) => {
      console.log('disco')
      cleanup({
        type: FirstNodeProcessEventType.Disconnect,
        event,
      })
    }
    const handleError = (event) => {
      console.log('er')
      cleanup({
        type: FirstNodeProcessEventType.Error,
        event,
      })
    }
    const handleMessage = (event) => {
      cleanup({
        type: FirstNodeProcessEventType.Message,
        event,
      })
    }
    const handleExit = (event) => {
      console.log('exit')
      cleanup({
        type: FirstNodeProcessEventType.Exit,
        event,
      })
    }
    process.on('disconnect', handleDisconnect)
    process.on('error', handleError)
    process.on('message', handleMessage)
    process.on('exit', handleExit)
  })
  return {
    type,
    event,
  }
}
