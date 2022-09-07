import { join } from 'node:path'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild, getFixture } from './_shared.js'

test('sample.toggle-multi-line-comment', async () => {
  const child = createChild()
  const server = TsServer.create(child)
  const fixture = getFixture('sample.toggle-multi-line-comment')
  await TsServerRequests.configure(server, {})
  await TsServerRequests.updateOpen(server, {
    openFiles: [
      {
        file: join(fixture, 'src', 'index.ts'),
      },
    ],
  })
  expect(
    await TsServerRequests.toggleMultilineComment(server, {
      file: join(fixture, 'src', 'index.ts'),
      startLine: 1,
      startOffset: 1,
      endOffset: 1,
      endLine: 1,
    })
  ).toEqual([
    {
      end: {
        line: 1,
        offset: 1,
      },
      newText: '/*',
      start: {
        line: 1,
        offset: 1,
      },
    },
    {
      end: {
        line: 1,
        offset: 1,
      },
      newText: '*/',
      start: {
        line: 1,
        offset: 1,
      },
    },
  ])
})
