import { jest } from '@jest/globals'
import * as TsServerCommandType from '../src/parts/TsServerCommandType/TsServerCommandType.js'
import * as TsServerMessageType from '../src/parts/TsServerMessageType/TsServerMessageType.js'

jest.unstable_mockModule('../src/parts/Id/Id.js', () => {
  return {
    create() {
      return 1
    },
  }
})

const TsServerRequests = await import(
  '../src/parts/TsServerRequestsEncodedSemanticClassificationsFull/TsServerRequestsEncodedSemanticClassificationsFull.js'
)

test('encodedSemanticClassificationsFull', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: true,
        body: {
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
        },
      }
    }),
  }
  expect(
    // @ts-ignore
    await TsServerRequests.encodedSemanticClassificationsFull(server, {
      file: '/test/index.ts',
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
  expect(server.invoke).toHaveBeenCalledTimes(1)
  expect(server.invoke).toHaveBeenCalledWith({
    arguments: {
      file: '/test/index.ts',
      format: '2020',
      length: 21,
      start: 0,
    },
    command: TsServerCommandType.EncodedSemanticClassificationsFull,
    seq: 1,
    type: TsServerMessageType.Request,
  })
})
