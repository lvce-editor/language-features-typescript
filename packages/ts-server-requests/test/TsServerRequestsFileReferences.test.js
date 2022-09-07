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
  '../src/parts/TsServerRequestsFileReferences/TsServerRequestsFileReferences.js'
)

test('fileReferences', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: true,
        body: {
          refs: [], // TODO should find reference to index.ts file
          symbolName: `"/test/calculate.ts"`,
        },
      }
    }),
  }
  expect(
    // @ts-ignore
    await TsServerRequests.fileReferences(server, {
      file: '/test/calculate.ts',
    })
  ).toEqual({
    refs: [], // TODO should find reference to index.ts file
    symbolName: `"/test/calculate.ts"`,
  })
  expect(server.invoke).toHaveBeenCalledTimes(1)
  expect(server.invoke).toHaveBeenCalledWith({
    arguments: {
      file: '/test/calculate.ts',
    },
    command: TsServerCommandType.FileReferences,
    seq: 1,
    type: TsServerMessageType.Request,
  })
})

test('fileReferences - error - debug failure', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: false,
        message: `Debug Failure. False expression.`,
      }
    }),
  }
  await expect(
    // @ts-ignore
    TsServerRequests.fileReferences(server, {
      file: '/test/calculate.ts',
    })
  ).rejects.toThrowError(
    new Error(
      'TsServer.fileReferences failed to execute: Debug Failure. False expression.'
    )
  )
})

test('fileReferences - tsServerError - no project', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: false,
        message: `No Project.`,
      }
    }),
  }
  await expect(
    // @ts-ignore
    TsServerRequests.fileReferences(server, {
      file: '/test/cat.ts',
    })
  ).rejects.toThrowError(
    new Error('TsServer.fileReferences failed to execute: No Project.')
  )
})
