import { join } from 'node:path'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild, getFixture } from './_shared.js'

test.skip('sample.completion-details', async () => {
  const child = createChild()
  const server = TsServer.create(child)
  const fixture = getFixture('sample.completion')
  await TsServerRequests.configure(server, {})
  await TsServerRequests.updateOpen(server, {
    openFiles: [
      {
        file: join(fixture, 'src', 'index.ts'),
      },
    ],
  })
  expect(
    await TsServerRequests.completionInfo(server, {
      file: join(fixture, 'src', 'index.ts'),
      line: 1,
      offset: 2,
    })
  ).toEqual({
    entries: expect.arrayContaining([
      {
        kind: 'keyword',
        kindModifiers: '',
        name: 'const',
        sortText: '15',
      },
    ]),
    flags: 0,
    isGlobalCompletion: true,
    isMemberCompletion: false,
    isNewIdentifierLocation: false,
  })
})
