import { join } from 'node:path'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild, getFixture } from './_shared.js'

test('sample.organize-imports', async () => {
  const child = createChild()
  const server = TsServer.create(child)
  const fixture = getFixture('sample.organize-imports')
  await TsServerRequests.configure(server, {})
  await TsServerRequests.updateOpen(server, {
    openFiles: [
      {
        file: join(fixture, 'src', 'index.ts'),
      },
    ],
  })
  expect(
    await TsServerRequests.organizeImports(server, {
      scope: {
        type: 'file',
        args: {
          file: join(fixture, 'src', 'index.ts'),
        },
      },
    })
  ).toEqual([
    {
      fileName: join(fixture, 'src', 'index.ts'),
      textChanges: [
        {
          end: { line: 2, offset: 1 },
          newText:
            process.platform === 'win32'
              ? "import { add } from './calculate'\r\n"
              : "import { add } from './calculate'\n",
          start: { line: 1, offset: 1 },
        },
      ],
    },
  ])
})
