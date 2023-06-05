import * as FirstNodeProcessEventType from '../FirstNodeProcessEventType/FirstNodeProcessEventType.js'

export const getFirstNodeProcessEvent = async (process) => {
  const { type, event } = await new Promise((resolve) => {
    const cleanup = (value) => {
      process.off('disconnect', handleDisconnect)
      process.off('error', handleError)
      process.off('message', handleMessage)
      process.off('exit', handleExit)
      process.off('spawn', handleSpawn)
      resolve(value)
    }
    const handleDisconnect = (event) => {
      cleanup({
        type: FirstNodeProcessEventType.Disconnect,
        event,
      })
    }
    const handleError = (event) => {
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
      cleanup({
        type: FirstNodeProcessEventType.Exit,
        event,
      })
    }
    const handleSpawn = (event) => {
      cleanup({
        type: FirstNodeProcessEventType.Spawn,
        event,
      })
    }
    process.on('disconnect', handleDisconnect)
    process.on('error', handleError)
    process.on('message', handleMessage)
    process.on('exit', handleExit)
    process.on('spawn', handleSpawn)
  })
  return {
    type,
    event,
  }
}
