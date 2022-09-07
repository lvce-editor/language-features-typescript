import { join } from 'node:path'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild, getFixture } from './_shared.js'

// TODO should find test case that returns actual result

test('sample.type-definition-no-result', async () => {
  const child = createChild()
  const server = TsServer.create(child)
  const fixture = getFixture('sample.type-definition-no-result')
  await TsServerRequests.configure(server, {})
  await TsServerRequests.updateOpen(server, {
    openFiles: [
      {
        file: join(fixture, 'src', 'index.ts'),
      },
    ],
  })
  expect(
    await TsServerRequests.typeDefinition(server, {
      file: join(fixture, 'src', 'index.ts'),
      line: 3,
      offset: 6,
    })
  ).toEqual([])
})