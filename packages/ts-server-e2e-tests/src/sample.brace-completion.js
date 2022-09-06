import { join } from 'node:path'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { fork } from 'node:child_process'
import { dirname } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { createChild } from './_shared.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const root = join(__dirname, '..', '..', '..')

const tsServerArgs = [
  '--useInferredProjectPerProjectRoot',
  '--disableAutomaticTypingAcquisition',
  '--locale',
  'en',
  '--noGetErrOnBackgroundUpdate',
  '--suppressDiagnosticEvents',
  '--useNodeIpc',
]

test('sample.brace-completion', async () => {
  const child = createChild({ tsServerArgs })
  const server = TsServer.create(child)
  const fixtures = join(root, 'packages', 'ts-server-e2e-tests', 'fixtures')
  const fixture = join(fixtures, 'sample.brace-completion')
  await TsServerRequests.configure(server, {})
  await TsServerRequests.updateOpen(server, {
    openFiles: [
      {
        file: join(fixture, 'src', 'index.ts'),
      },
    ],
  })
  await TsServerRequests.braceCompletion(server, {
    file: join(fixture, 'src', 'index.ts'),
    line: 1,
    offset: 2,
    openingBrace: '{',
  })
  child.dispose()
})
