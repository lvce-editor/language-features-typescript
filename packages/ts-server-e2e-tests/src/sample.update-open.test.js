import { join } from 'node:path'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild, getFixture } from './_shared.js'

test('sample.update-open', async () => {
  const child = createChild()
  const server = TsServer.create(child)
  const fixture = getFixture('sample.update-open')
  await TsServerRequests.configure(server, {})
  await TsServerRequests.updateOpen(server, {
    openFiles: [
      {
        file: join(fixture, 'src', 'index.ts'),
        fileContent: `const add = (a: number, b: number) => {\n  return a + b;\n}`,
      },
    ],
  })
  expect(
    await TsServerRequests.updateOpen(server, {
      changedFiles: [
        {
          fileName: join(fixture, 'src', 'index.ts'),
          textChanges: [
            {
              start: { line: 2, offset: 16 },
              end: { line: 2, offset: 16 },
              newText: ' ',
            },
          ],
        },
      ],
    })
  ).toBe(true)
})
