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
  '../src/parts/TsServerRequests/TsServerRequests.js'
)
// TODO test errors

// TODO what to test?
test('exit', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: true,
        body: undefined,
      }
    }),
  }
  TsServerRequests.exit(server)
  expect(server.invoke).toHaveBeenCalledTimes(1)
  expect(server.invoke).toHaveBeenCalledWith({
    command: TsServerCommandType.Exit,
    type: TsServerMessageType.Request,
  })
})
