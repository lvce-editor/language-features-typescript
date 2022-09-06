import { join } from 'node:path'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild, getFixture } from './_shared.js'

test('sample.indentation', async () => {
  const child = createChild()
  const server = TsServer.create(child)
  const fixture = getFixture('sample.indentation')
  await TsServerRequests.configure(server, {})
  await TsServerRequests.updateOpen(server, {
    openFiles: [
      {
        file: join(fixture, 'src', 'index.ts'),
      },
    ],
  })
  expect(
    await TsServerRequests.indentation(server, {
      file: join(fixture, 'src', 'index.ts'),
      line: 1,
      offset: 10,
    })
  ).toEqual({ indentation: 2, position: 9 })
})
