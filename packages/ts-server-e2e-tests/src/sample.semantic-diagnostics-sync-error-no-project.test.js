import { join } from 'node:path'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild, getFixture } from './_shared.js'

test('sample.semantic-diagnostics-sync-error-no-project', async () => {
  const child = createChild()
  const server = TsServer.create(child)
  const fixture = getFixture(
    'sample.semantic-diagnostics-sync-error-no-project'
  )
  await TsServerRequests.configure(server, {})
  await TsServerRequests.updateOpen(server, {
    openFiles: [
      {
        file: join(fixture, 'src', 'index.ts'),
      },
    ],
  })
  await expect(
    TsServerRequests.semanticDiagnosticsSync(server, {
      file: join(fixture, 'src', 'cat.ts'),
    })
  ).rejects.toThrowError(
    new Error('TsServer.semanticDiagnosticsSync failed to execute: No Project.')
  )
})