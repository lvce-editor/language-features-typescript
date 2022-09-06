import { join } from 'node:path'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild, getFixture } from './_shared.js'

test('sample.completion-info-property', async () => {
  const child = createChild()
  const server = TsServer.create(child)
  const fixture = getFixture('sample.completion-info-property')
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
      offset: 11,
      prefix: 'add',
    })
  ).toEqual({
    entries: expect.arrayContaining([
      {
        kind: 'method',
        kindModifiers: 'declare',
        name: 'addEventListener',
        sortText: '11',
      },
    ]),
    flags: 0,
    isGlobalCompletion: false,
    isMemberCompletion: true,
    isNewIdentifierLocation: false,
    optionalReplacementSpan: {
      end: {
        line: 1,
        offset: 11,
      },
      start: {
        line: 1,
        offset: 8,
      },
    },
  })
})
