import { fork } from 'node:child_process'

export const create = ({ args }) => {
  const argsWithNodeIpc = [...args, '--useNodeIpc']
  const server = fork(argsWithNodeIpc[0], argsWithNodeIpc.slice(1), {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    // stdio: 'inherit',
  })
  server.stderr.pipe(process.stderr)
  server.stdout.pipe(process.stdout)
  const handleDisconnect = () => {
    console.info('[tsserver] disconnected')
  }
  const handleError = () => {
    console.info('[tsserver] error')
  }

  const handleSpawn = () => {
    console.info('[tsserver] spawn')
  }
  server.on('disconnect', handleDisconnect)
  server.on('error', handleError)
  server.on('spawn', handleSpawn)
  return {
    send(message) {
      server.send(message)
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
