import { join } from 'node:path'
import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild, getFixture } from './_shared.js'

test('sample.encodedSemanticClassificationsFull', async () => {
  const child = createChild()
  const server = TsServer.create(child)
  const fixture = getFixture('sample.encodedSemanticClassificationsFull')
  await TsServerRequests.configure(server, {})
  await TsServerRequests.updateOpen(server, {
    openFiles: [
      {
        file: join(fixture, 'src', 'index.ts'),
      },
    ],
  })
  expect(
    await TsServerRequests.encodedSemanticClassificationsFull(server, {
      file: join(fixture, 'src', 'index.ts'),
      format: '2020',
      start: 0,
      length: 21,
    })
  ).toEqual({
    endOfLineState: 0,
    // prettier-ignore
    spans: [
        4 /* offset */,
        1 /* length */,
        2049 /* (2049 >> 8) - 1 = 7 = variable, 2049 & 255 = 1 = 2^0 = declaration  */,

        16 /* offset */,
        1 /* length */,
        2057 /* (2057 >> 8) - 1 = 7 = variable, 2057 & 255 = 9 = 2^3 + 2^0 = declaration and readonly */,

        20 /* offset */,
        1 /* length */,
        2048 /* (2048 >> 8) - 1 = 7 = variable, 2048 & 255 = 0 = none */,
      ],
  })
})
