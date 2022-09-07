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
  '../src/parts/TsServerRequestsIndentation/TsServerRequestsIndentation.js'
)

test('indentation', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: true,
        body: { indentation: 2, position: 9 },
      }
    }),
  }
  expect(
    await TsServerRequests.indentation(server, {
      file: '/test/index.ts',
      line: 1,
      offset: 10,
    })
  ).toEqual({ indentation: 2, position: 9 })
  expect(server.invoke).toHaveBeenCalledTimes(1)
  expect(server.invoke).toHaveBeenCalledWith({
    arguments: {
      file: '/test/index.ts',
      line: 1,
      offset: 10,
    },
    command: TsServerCommandType.Indentation,
    seq: 1,
    type: TsServerMessageType.Request,
  })
})
