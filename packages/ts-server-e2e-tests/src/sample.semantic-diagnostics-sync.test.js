import { join } from 'node:path'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild, getFixture } from './_shared.js'

test('sample.semantic-diagnostics-sync', async () => {
  const child = createChild()
  const server = TsServer.create(child)
  const fixture = getFixture('sample.semantic-diagnostics-sync')
  await TsServerRequests.configure(server, {})
  await TsServerRequests.updateOpen(server, {
    openFiles: [
      {
        file: join(fixture, 'src', 'index.ts'),
      },
    ],
  })
  expect(
    await TsServerRequests.semanticDiagnosticsSync(server, {
      file: join(fixture, 'src', 'index.ts'),
    })
  ).toEqual([
    {
      category: 'error',
      code: 2691,
      end: {
        line: 1,
        offset: 47,
      },
      start: {
        line: 1,
        offset: 31,
      },
      text: "An import path cannot end with a '.ts' extension. Consider importing './calculate' instead.",
    },
  ])
})
