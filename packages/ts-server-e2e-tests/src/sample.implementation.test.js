import { join } from 'node:path'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild, getFixture } from './_shared.js'

test('sample.implementation', async () => {
  const child = createChild()
  const server = TsServer.create(child)
  const fixture = getFixture('sample.implementation')
  await TsServerRequests.configure(server, {})
  await TsServerRequests.updateOpen(server, {
    openFiles: [
      {
        file: join(fixture, 'src', 'index.ts'),
      },
    ],
  })
  expect(
    await TsServerRequests.implementation(server, {
      file: join(fixture, 'src', 'index.ts'),
      line: 2,
      offset: 14,
    })
  ).toEqual([
    {
      contextEnd: { line: 1, offset: 28 },
      contextStart: { line: 1, offset: 1 },
      end: { line: 1, offset: 10 },
      file: join(fixture, 'src', 'index.ts'),
      start: { line: 1, offset: 7 },
    },
  ])
})
