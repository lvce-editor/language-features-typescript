import { join } from 'node:path'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild, getFixture } from './_shared.js'

test('sample.rename-can-rename', async () => {
  const child = createChild()
  const server = TsServer.create(child)
  const fixture = getFixture('sample.rename-can-rename')
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
              line: 1,
              offset: 28,
            },
            contextStart: {
              line: 1,
              offset: 1,
            },
            end: {
              line: 1,
              offset: 10,
            },
            start: {
              line: 1,
              offset: 7,
            },
          },
          {
            end: {
              line: 2,
              offset: 4,
            },
            start: {
              line: 2,
              offset: 1,
            },
          },
        ],
      },
    ],
  })
})
