import { fork } from 'node:child_process'
import * as FirstNodeProcessEventType from '../FirstNodeProcessEventType/FirstNodeProcessEventType.js'
import * as GetFirstNodeProcessEvent from '../GetFirstNodeProcessEvent/GetFirstNodeProcessEvent.js'
import { IpcError } from '../IpcError/IpcError.js'

const addLogPrefix = (line) => {
  return `[tsserver] ${line}`
}

/**
 *
 * @param {{path:string, argv:string[], execArgv:string[]}} param0
 * @returns
 */
export const create = async ({ path, argv, execArgv }) => {
  const actualArgv = [...argv, '--useNodeIpc']
  const server = fork(path, actualArgv, {
    execArgv,
    stdio: 'pipe',
  })

  const { type, event } = await GetFirstNodeProcessEvent.getFirstNodeProcessEvent(server)
  if (type === FirstNodeProcessEventType.Error) {
    throw new IpcError(`tsserver child process error: ${event}`)
  }
  if (type === FirstNodeProcessEventType.Disconnect) {
    throw new IpcError(`tsserver child process disconnected`)
  }
  if (type === FirstNodeProcessEventType.Exit) {
    throw new IpcError(`tsserver child process exited with code: ${event}`)
  }
  server.on('disconnect', () => {
    console.info('[tsserver] disconnected')
  })
  server.on('error', () => {
    console.info('[tsserver] error')
  })
  server.on('spawn', () => {
    console.info('[tsserver] spawn')
  })

  const handleStdErrData = (buffer) => {
    const data = buffer.toString()
    const lines = data.split('\n')
    const logLines = lines.map(addLogPrefix)
    const log = logLines.join('\n')
    console.info(log)
  }
  server.stderr.on('data', handleStdErrData)
  return server
}

export const wrap = (server) => {
  return {
    server,
    send(message) {
      this.server.send(message)
    },
    dispose() {
      this.server.kill()
    },
    onError(handler) {
      this.server.on('error', handler)
    },
    onExit(handler) {
      this.server.on('exit', handler)
    },
    onMessage(handler) {
      this.server.on('message', handler)
    },
  }
}
