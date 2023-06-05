import { spawn } from 'node:child_process'
import * as FirstNodeProcessEventType from '../FirstNodeProcessEventType/FirstNodeProcessEventType.js'
import * as GetFirstNodeProcessEvent from '../GetFirstNodeProcessEvent/GetFirstNodeProcessEvent.js'
import * as ParseTypeScriptRequests from '../ParseTypeScriptRequests/ParseTypeScriptRequests.js'

/**
 *
 * @param {{path:string, argv:string[], execArgv:string[]}} param0
 * @returns
 */
export const create = async ({ path, argv, execArgv }) => {
  const server = spawn(process.execPath, [...execArgv, path, ...argv], {
    stdio: 'pipe',
  })
  const { type, event } = await GetFirstNodeProcessEvent.getFirstNodeProcessEvent(server)
  if (type === FirstNodeProcessEventType.Error) {
    throw new Error(`tsserver child process error: ${event}`)
  }
  if (type === FirstNodeProcessEventType.Disconnect) {
    throw new Error(`tsserver child process disconnected`)
  }
  if (type === FirstNodeProcessEventType.Exit) {
    throw new Error(`tsserver child process exited with code: ${event}`)
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
  return server
}

export const wrap = (server) => {
  return {
    server,
    send(message) {
      this.server.stdin.write(JSON.stringify(message) + '\r\n', 'utf-8')
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
      const parser = ParseTypeScriptRequests.createParser({
        onMessage: handler,
      })
      const handleStdoutData = (data) => {
        parser.append(data)
      }
      server.stdout.on('data', handleStdoutData)
    },
  }
}
