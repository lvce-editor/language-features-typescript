import { join } from 'node:path'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild, getFixture } from './_shared.js'

test('sample.references-in-multiple-files', async () => {
  const child = createChild()
  const server = TsServer.create(child)
  const fixture = getFixture('sample.references-in-multiple-files')
  await TsServerRequests.configure(server, {})
  await TsServerRequests.updateOpen(server, {
    openFiles: [
      {
        file: join(fixture, 'src', 'index.ts'),
      },
    ],
  })
  expect(
    await TsServerRequests.references(server, {
      file: join(fixture, 'src', 'index.ts'),
      line: 1,
      offset: 10,
    })
  ).toEqual({
    refs: [
      {
        contextEnd: {
          line: 1,
          offset: 31,
        },
        contextStart: {
          line: 1,
          offset: 1,
        },
        end: {
          line: 1,
          offset: 13,
        },
        file: join(fixture, 'src', 'index.ts'),
        isDefinition: true,
        isWriteAccess: true,
        lineText: "import { add } from './add.js'",
        start: {
          line: 1,
          offset: 10,
        },
      },
      {
        end: {
          line: 3,
          offset: 4,
        },
        file: join(fixture, 'src', 'index.ts'),
        isDefinition: false,
        isWriteAccess: false,
        lineText: 'add(1, 2)',
        start: {
          line: 3,
          offset: 1,
        },
      },
      {
        contextEnd: {
          line: 1,
          offset: 32,
        },
        contextStart: {
          line: 1,
          offset: 1,
        },
        end: {
          line: 1,
          offset: 17,
        },
        file: join(fixture, 'src', 'add.ts'),
        isDefinition: false,
        isWriteAccess: true,
        lineText: 'export const add = (a, b) => {}',
        start: {
          line: 1,
          offset: 14,
        },
      },
    ],
    symbolDisplayString: `(alias) const add: (a: any, b: any) => void
import add`,
    symbolName: 'add',
    symbolStartOffset: 10,
  })
})
