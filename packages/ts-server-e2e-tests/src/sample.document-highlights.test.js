import { join } from 'node:path'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild, getFixture } from './_shared.js'

test('sample.document-highlights', async () => {
  const child = createChild()
  const server = TsServer.create(child)
  const fixture = getFixture('sample.document-highlights')
  await TsServerRequests.configure(server, {})
  await TsServerRequests.updateOpen(server, {
    openFiles: [
      {
        file: join(fixture, 'src', 'index.ts'),
      },
    ],
  })
  expect(
    await TsServerRequests.documentHighlights(server, {
      file: join(fixture, 'src', 'index.ts'),
      line: 1,
      offset: 5,
      filesToSearch: [join(fixture, 'src', 'index.ts')],
    })
  ).toEqual([
    {
      file: join(fixture, 'src', 'index.ts'),
      highlightSpans: [
        {
          contextEnd: {
            line: 1,
            offset: 10,
          },
          contextStart: {
            line: 1,
            offset: 1,
          },
          end: {
            line: 1,
            offset: 6,
          },
          kind: 'writtenReference',
          start: {
            line: 1,
            offset: 5,
          },
        },
        {
          end: {
            line: 2,
            offset: 12,
          },
          kind: 'reference',
          start: {
            line: 2,
            offset: 11,
          },
        },
      ],
    },
  ])
})
