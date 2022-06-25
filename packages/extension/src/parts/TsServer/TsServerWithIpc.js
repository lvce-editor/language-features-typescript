import * as ChildProcess from '../ChildProcess/ChildProcess.js'

export const create = ({ args }) => {
  const argsWithNodeIpc = [...args, '--useNodeIpc']
  const server = ChildProcess.create(argsWithNodeIpc, {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
  })
  server.stderr.pipe(process.stderr)
  server.on('disconnect', () => {
    console.info('[tsserver] disconnected')
  })
  server.on('error', () => {
    console.info('[tsserver] error')
  })
  server.on('spawn', () => {
    console.info('[tsserver] spawn')
  })
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
