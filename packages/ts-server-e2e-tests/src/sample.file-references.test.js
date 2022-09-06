import { join } from 'node:path'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild, getFixture } from './_shared.js'

test('sample.file-references', async () => {
  const child = createChild()
  const server = TsServer.create(child)
  const fixture = getFixture('sample.file-references')
  await TsServerRequests.configure(server, {})
  await TsServerRequests.updateOpen(server, {
    openFiles: [
      {
        file: join(fixture, 'src', 'index.ts'),
      },
    ],
  })
  expect(
    await TsServerRequests.fileReferences(server, {
      file: join(fixture, 'src', 'calculate.ts'),
    })
  ).toEqual({
    refs: [
      {
        contextEnd: {
          line: 1,
          offset: 44,
        },
        contextStart: {
          line: 1,
          offset: 1,
        },
        end: {
          line: 1,
          offset: 43,
        },
        file: join(fixture, 'src', 'index.ts'),
        isWriteAccess: false,
        lineText: "import { add, subtract } from './calculate'",
        start: {
          line: 1,
          offset: 32,
        },
      },
    ],
    symbolName: '"' + join(fixture, 'src', 'calculate.ts') + '"',
  })
})
