import { join } from 'node:path'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild, getFixture } from './_shared.js'

test('sample.rename-error-cannot-read-properties-of-undefined', async () => {
  const child = createChild()
  const server = TsServer.create(child)
  const fixture = getFixture(
    'sample.rename-error-cannot-read-properties-of-undefined'
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
    TsServerRequests.rename(server, {
      file: join(fixture, 'src', 'cat.ts'),
      line: 1,
      offset: 2,
    })
  ).rejects.toThrowError(
    new Error(
      "TsServer.rename failed to execute: TypeError: Cannot read properties of undefined (reading 'lineOffsetToPosition')"
    )
  )
})
