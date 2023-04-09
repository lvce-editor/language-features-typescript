import * as ChildProcess from '../ChildProcess/ChildProcess.js'
import * as ParseTypeScriptRequests from '../ParseTypeScriptRequests/ParseTypeScriptRequests.js'

export const create = ({ args }) => {
  const server = ChildProcess.create(args, {
    stdio: 'pipe',
  })
  server.stderr.pipe(process.stderr)
  return server
}

export const wrap = (server) => {
  return {
    send(message) {
      server.stdin.write(JSON.stringify(message) + '\r\n', 'utf-8')
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
