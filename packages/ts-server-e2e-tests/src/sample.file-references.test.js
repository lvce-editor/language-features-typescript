import { join } from 'node:path'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild, getFixture } from './_shared.js'

test('sample.fileReferences', async () => {
  const child = createChild()
  const server = TsServer.create(child)
  const fixture = getFixture('sample.fileReferences')
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
    refs: [], // TODO should find reference to index.ts file
    symbolName: `"${join(fixture, 'src', 'calculate.ts')}"`,
  })
})
