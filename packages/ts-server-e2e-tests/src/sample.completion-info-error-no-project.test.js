import { join } from 'node:path'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild, getFixture } from './_shared.js'

test.skip('sample.completion-info-error-no-project', async () => {
  const child = createChild()
  const server = TsServer.create(child)
  const fixture = getFixture('sample.completion-info-error-no-project')
  await TsServerRequests.configure(server, {})
  await TsServerRequests.updateOpen(server, {
    openFiles: [
      {
        file: join(fixture, 'src', 'index.ts'),
      },
    ],
  })
  await expect(
    TsServerRequests.completionInfo(server, {
      file: join(fixture, 'src', 'index.ts'),
      line: 0,
      offset: 0,
    })
  ).rejects.toThrowError(new Error('abc'))
})
