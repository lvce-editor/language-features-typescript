import assert from 'assert/strict'
import test from 'node:test'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild } from './_shared.js'

const tsServerArgs = [
  '--useInferredProjectPerProjectRoot',
  '--disableAutomaticTypingAcquisition',
  '--locale',
  'en',
  '--noGetErrOnBackgroundUpdate',
  '--suppressDiagnosticEvents',
  '--useNodeIpc',
]

test('sample.configure', async () => {
  const child = createChild({ tsServerArgs })
  const server = TsServer.create(child)
  assert.strictEqual(await TsServerRequests.configure(server, {}), undefined)
  child.dispose()
})
