import { join } from 'node:path'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild, getFixture } from './_shared.js'

test('sample.implementation-error-no-project', async () => {
  const child = createChild()
  const server = TsServer.create(child)
  const fixture = getFixture('sample.implementation-error-no-project')
  await TsServerRequests.configure(server, {})
  await TsServerRequests.updateOpen(server, {
    openFiles: [
      {
        file: join(fixture, 'src', 'index.ts'),
      },
    ],
  })
  await expect(
    TsServerRequests.implementation(server, {
      file: join(fixture, 'src', 'cat.ts'),
      line: 2,
      offset: 14,
    })
  ).rejects.toThrowError(
    new Error('TsServer.implementation failed to execute: No Project.')
  )
})
