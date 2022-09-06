import { join } from 'node:path'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild, getFixture } from './_shared.js'

test('sample.document-highlights-error-debug-failure', async () => {
  const child = createChild()
  const server = TsServer.create(child)
  const fixture = getFixture('sample.document-highlights-error-debug-failure')
  await TsServerRequests.configure(server, {})
  await TsServerRequests.updateOpen(server, {
    openFiles: [
      {
        file: join(fixture, 'src', 'index.ts'),
      },
    ],
  })
  await expect(
    TsServerRequests.documentHighlights(server, {
      file: join(fixture, 'src', 'index.ts'),
      line: 1,
      offset: 5,
      filesToSearch: ['**'],
    })
  ).rejects.toThrowError(
    new Error(
      'TsServer.documentHighlights failed to execute: Debug Failure. False expression.'
    )
  )
})
