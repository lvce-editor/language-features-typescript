import { join } from 'node:path'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { fork } from 'node:child_process'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'assert/strict'
import test from 'node:test'

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

test('sample.configure', async () => {
  const child = createChild({ tsServerPath, tsServerArgs })
  const server = TsServer.create(child)
  assert.strictEqual(await TsServerRequests.configure(server, {}), undefined)
})
