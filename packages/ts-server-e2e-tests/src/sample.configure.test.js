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
  expect(await TsServerRequests.configure(server, {})).toBeUndefined()
})
