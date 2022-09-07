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
  '../src/parts/TsServerRequestsTypeDefinition/TsServerRequestsTypeDefinition.js'
)

// TODO should find test case that returns actual result
test('typeDefinition - no result', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: true,
        body: [],
      }
    }),
  }
  expect(
    await TsServerRequests.typeDefinition(server, {
      file: '/test/index.ts',
      line: 3,
      offset: 6,
    })
  ).toEqual([])
  expect(server.invoke).toHaveBeenCalledTimes(1)
  expect(server.invoke).toHaveBeenCalledWith({
    arguments: {
      file: '/test/index.ts',
      line: 3,
      offset: 6,
    },
    command: TsServerCommandType.TypeDefinition,
    seq: 1,
    type: TsServerMessageType.Request,
  })
})

test('typeDefinition - error - no project', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: false,
        message: `No Project.`,
      }
    }),
  }
  await expect(
    TsServerRequests.typeDefinition(server, {
      file: '/test/cat.ts',
      line: 3,
      offset: 6,
    })
  ).rejects.toThrowError(
    new Error('TsServer.typeDefinition failed to execute: No Project.')
  )
})
