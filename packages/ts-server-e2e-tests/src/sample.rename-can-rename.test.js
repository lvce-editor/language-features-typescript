import { join } from 'node:path'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild, getFixture } from './_shared.js'

test.skip('sample.can-rename', async () => {
  const child = createChild()
  const server = TsServer.create(child)
  const fixture = getFixture('sample.can-rename')
  await TsServerRequests.configure(server, {})
  await TsServerRequests.updateOpen(server, {
    openFiles: [
      {
        file: join(fixture, 'src', 'index.ts'),
      },
    ],
  })
  expect(
    await TsServerRequests.rename(server, {
      file: join(fixture, 'src', 'index.ts'),
      line: 2,
      offset: 2,
    })
  ).toEqual({
    info: {
      canRename: true,
      displayName: 'add',
      fullDisplayName: 'add',
      kind: 'const',
      kindModifiers: '',
      triggerSpan: {
        end: {
          line: 2,
          offset: 4,
        },
        start: {
          line: 2,
          offset: 1,
        },
      },
    },
    locs: [
      {
        file: join(fixture, 'src', 'index.ts'),
        locs: [
          {
            contextEnd: {
              line: 2,
              offset: 12,
            },
            contextStart: {
              line: 2,
              offset: 1,
            },
            end: {
              line: 2,
              offset: 8,
            },
            start: {
              line: 2,
              offset: 7,
            },
          },
        ],
      },
    ],
  })
})
