import { join } from 'node:path'
import { TsServer, TsServerProcess } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'

import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fork } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))

const root = join(__dirname, '..', '..', '..')

const tsServerPath = join(
  root,
  'node_modules',
  'typescript',
  'lib',
  'tsserver.js'
)

const tsServerArgs = [
  '--useInferredProjectPerProjectRoot',
  '--disableAutomaticTypingAcquisition',
  '--locale',
  'en',
  '--noGetErrOnBackgroundUpdate',
  '--suppressDiagnosticEvents',
  '--useNodeIpc',
]

const createChild = ({ tsServerPath, tsServerArgs }) => {
  const child = fork(tsServerPath, [...tsServerArgs])
  return {
    onMessage(listener) {
      child.on('message', listener)
    },
    send(message) {
      child.send(message)
    },
    dispose() {
      child.kill()
    },
  }
}

const main = async () => {
  const child = createChild({ tsServerPath, tsServerArgs })
  const server = TsServer.create(child)
  const fixture = ``
  await TsServerRequests.configure(server, {})
  await TsServerRequests.braceCompletion(server, {
    file: join(fixture, 'src', 'index.ts'),
    line: 1,
    offset: 2,
    openingBrace: '{',
  })
}

main()
