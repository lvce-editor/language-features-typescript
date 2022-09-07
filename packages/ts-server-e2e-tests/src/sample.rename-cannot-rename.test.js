import { join } from 'node:path'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild, getFixture } from './_shared.js'

test('sample.rename-cannot-rename', async () => {
  const child = createChild()
  const server = TsServer.create(child)
  const fixture = getFixture('sample.rename-cannot-rename')
  await TsServerRequests.configure(server, {})
  await TsServerRequests.updateOpen(server, {
    openFiles: [
      {
        file: join(fixture, 'src', 'index.ts'),
      },
    ],
  })
  expect(
    await TsServerRequests.rename(server, {
      file: join(fixture, 'src', 'index.ts'),
      line: 1,
      offset: 2,
    })
  ).toEqual({
    info: {
      canRename: false,
      localizedErrorMessage: 'You cannot rename this element.',
    },
    locs: [],
  })
})
