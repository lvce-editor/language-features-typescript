import { join } from 'node:path'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild, getFixture } from './_shared.js'

test('sample.references', async () => {
  const child = createChild()
  const server = TsServer.create(child)
  const fixture = getFixture('sample.references')
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
      offset: 7,
    })
  ).toEqual({
    refs: [
      {
        contextEnd: { line: 3, offset: 2 },
        contextStart: { line: 1, offset: 1 },
        end: { line: 1, offset: 10 },
        file: join(fixture, 'src', 'index.ts'),
        isDefinition: true,
        isWriteAccess: true,
        lineText: 'const add = (a, b) => {',
        start: { line: 1, offset: 7 },
      },
      {
        end: { line: 5, offset: 4 },
        file: join(fixture, 'src', 'index.ts'),
        isDefinition: false,
        isWriteAccess: false,
        lineText: 'add(1, 2)',
        start: { line: 5, offset: 1 },
      },
      {
        end: { line: 6, offset: 4 },
        file: join(fixture, 'src', 'index.ts'),
        isDefinition: false,
        isWriteAccess: false,
        lineText: 'add(3, 4)',
        start: { line: 6, offset: 1 },
      },
    ],
    symbolDisplayString: 'const add: (a: any, b: any) => any',
    symbolName: 'add',
    symbolStartOffset: 7,
  })
})
