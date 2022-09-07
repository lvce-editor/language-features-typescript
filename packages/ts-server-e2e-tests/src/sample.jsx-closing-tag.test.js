import { join } from 'node:path'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild, getFixture } from './_shared.js'

test('sample.jsx-closing-tag', async () => {
  const child = createChild()
  const server = TsServer.create(child)
  const fixture = getFixture('sample.jsx-closing-tag')
  await TsServerRequests.configure(server, {})
  await TsServerRequests.updateOpen(server, {
    openFiles: [
      {
        file: join(fixture, 'src', 'index.tsx'),
        projectRootPath: fixture,
        scriptKindName: 'TSX',
      },
    ],
  })
  await TsServerRequests.updateOpen(server, {
    changedFiles: [
      {
        fileName: join(fixture, 'src', 'index.tsx'),
        textChanges: [
          {
            newText: '>',
            start: {
              line: 2,
              offset: 14,
            },
            end: {
              line: 2,
              offset: 14,
            },
          },
        ],
      },
    ],
  })
  expect(
    await TsServerRequests.jsxClosingTag(server, {
      file: join(fixture, 'src', 'index.tsx'),
      line: 2,
      offset: 15,
    })
  ).toEqual({
    caretOffset: 0,
    newText: '</div>',
  })
})
