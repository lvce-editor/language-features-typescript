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

const TsServerRequestsBraceCompletion = await import(
  '../src/parts/TsServerRequestsBraceCompletion/TsServerRequestsBraceCompletion.js'
)
// TODO test errors

test('braceCompletion', async () => {
  const server = {
    invoke: jest.fn(() => {
      return {
        success: true,
        body: true,
      }
    }),
  }
  expect(
    await TsServerRequestsBraceCompletion.braceCompletion(server, {
      file: '/test/index.ts',
      line: 1,
      offset: 2,
      openingBrace: '{',
    })
  ).toBe(true)
  expect(server.invoke).toHaveBeenCalledTimes(1)
  expect(server.invoke).toHaveBeenCalledWith({
    arguments: {
      file: '/test/index.ts',
      line: 1,
      offset: 2,
      openingBrace: '{',
    },
    command: TsServerCommandType.BraceCompletion,
    seq: 1,
    type: TsServerMessageType.Request,
  })
})
