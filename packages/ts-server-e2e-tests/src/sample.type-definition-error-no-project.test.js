import { join } from 'node:path'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild, getFixture } from './_shared.js'

test('sample.type-definition-error-no-project', async () => {
  const child = createChild()
  const server = TsServer.create(child)
  const fixture = getFixture('sample.type-definition-error-no-project')
  await TsServerRequests.configure(server, {})
  await TsServerRequests.updateOpen(server, {
    openFiles: [
      {
        file: join(fixture, 'src', 'index.ts'),
      },
    ],
  })
  await expect(
    TsServerRequests.typeDefinition(server, {
      file: join(fixture, 'src', 'cat.ts'),
      line: 3,
      offset: 6,
    })
  ).rejects.toThrowError(
    new Error('TsServer.typeDefinition failed to execute: No Project.')
  )
})
