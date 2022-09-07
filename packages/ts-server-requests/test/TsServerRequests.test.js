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

test('updateOpen - issue with textChanges', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: true,
        body: true,
      }
    }),
  }
  expect(
    await TsServerRequests.updateOpen(server, {
      changedFiles: [
        {
          fileName: '/test/index.ts',
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
  expect(server.invoke).toHaveBeenCalledTimes(1)
  expect(server.invoke).toHaveBeenCalledWith({
    arguments: {
      changedFiles: [
        {
          fileName: '/test/index.ts',
          textChanges: [
            {
              end: {
                line: 2,
                offset: 16,
              },
              newText: ' ',
              start: {
                line: 2,
                offset: 16,
              },
            },
          ],
        },
      ],
    },
    command: TsServerCommandType.UpdateOpen,
    seq: 1,
    type: TsServerMessageType.Request,
  })
})
