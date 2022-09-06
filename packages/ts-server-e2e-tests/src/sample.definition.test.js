import { join } from 'node:path'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild, getFixture } from './_shared.js'

test('sample.definition', async () => {
  const child = createChild()
  const server = TsServer.create(child)
  const fixture = getFixture('sample.definition')
  await TsServerRequests.configure(server, {})
  await TsServerRequests.updateOpen(server, {
    openFiles: [
      {
        file: join(fixture, 'src', 'index.ts'),
      },
    ],
  })
  expect(
    await TsServerRequests.definition(server, {
      file: join(fixture, 'src', 'index.ts'),
      line: 2,
      offset: 7,
    })
  ).toEqual([
    {
      contextEnd: { line: 2, offset: 12 },
      contextStart: { line: 2, offset: 1 },
      end: { line: 2, offset: 8 },
      file: join(fixture, 'src', 'index.ts'),
      start: { line: 2, offset: 7 },
    },
  ])
})
