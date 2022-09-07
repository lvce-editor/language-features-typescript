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
  '../src/parts/TsServerRequestsDefinition/TsServerRequestsDefinition.js'
)

test('definition', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: true,
        body: [
          {
            contextEnd: { line: 2, offset: 12 },
            contextStart: { line: 2, offset: 1 },
            end: { line: 2, offset: 8 },
            file: '/test/index.ts',
            start: { line: 2, offset: 7 },
          },
        ],
      }
    }),
  }
  expect(
    // @ts-ignore
    await TsServerRequests.definition(server, {
      file: '/test/index.ts',
      line: 2,
      offset: 7,
    })
  ).toEqual([
    {
      contextEnd: { line: 2, offset: 12 },
      contextStart: { line: 2, offset: 1 },
      end: { line: 2, offset: 8 },
      file: '/test/index.ts',
      start: { line: 2, offset: 7 },
    },
  ])
  expect(server.invoke).toHaveBeenCalledTimes(1)
  expect(server.invoke).toHaveBeenCalledWith({
    arguments: {
      file: '/test/index.ts',
      line: 2,
      offset: 7,
    },
    command: TsServerCommandType.Definition,
    seq: 1,
    type: TsServerMessageType.Request,
  })
})
