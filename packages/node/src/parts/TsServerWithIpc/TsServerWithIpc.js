import * as ChildProcess from '../ChildProcess/ChildProcess.js'
import * as GetFirstNodeProcessEvent from '../GetFirstNodeProcessEvent/GetFirstNodeProcessEvent.js'
import * as FirstNodeProcessEventType from '../FirstNodeProcessEventType/FirstNodeProcessEventType.js'

export const name = 'ipc'

export const create = async ({ args }) => {
  // TODO wait for server to be launched
  const argsWithNodeIpc = [...args, '--useNodeIpc']
  const server = ChildProcess.create(argsWithNodeIpc, {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
  })
  server.stderr.pipe(process.stderr)
  const { type, event } =
    await GetFirstNodeProcessEvent.getFirstNodeProcessEvent(server)
  console.log({ type, event })
  if (type === FirstNodeProcessEventType.Error) {
    throw new Error(`tsserver child process error: ${event}`)
  }
  if (type === FirstNodeProcessEventType.Disconnect) {
    throw new Error(`tsserver child process disconnected`)
  }
  if (type === FirstNodeProcessEventType.Exit) {
    throw new Error(`tsserver child process exited with code: ${event}`)
  }
  console.log({ event })
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
    send() {
      server.send('message')
    },
    dispose() {
      server.kill()
    },
    onError(handler) {
      server.on('error', handler)
    },
    onExit(handler) {
      server.on('exit', handler)
    },
    onMessage(handler) {
      server.on('message', handler)
    },
  }
}
