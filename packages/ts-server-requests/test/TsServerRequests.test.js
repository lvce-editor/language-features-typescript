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

test('toggleMultilineComment', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: true,
        body: [
          {
            end: {
              line: 1,
              offset: 1,
            },
            newText: '/*',
            start: {
              line: 1,
              offset: 1,
            },
          },
          {
            end: {
              line: 1,
              offset: 1,
            },
            newText: '*/',
            start: {
              line: 1,
              offset: 1,
            },
          },
        ],
      }
    }),
  }
  expect(
    await TsServerRequests.toggleMultilineComment(server, {
      file: '/test/index.ts',
      startLine: 1,
      startOffset: 1,
      endOffset: 1,
      endLine: 1,
    })
  ).toEqual([
    {
      end: {
        line: 1,
        offset: 1,
      },
      newText: '/*',
      start: {
        line: 1,
        offset: 1,
      },
    },
    {
      end: {
        line: 1,
        offset: 1,
      },
      newText: '*/',
      start: {
        line: 1,
        offset: 1,
      },
    },
  ])
  expect(server.invoke).toHaveBeenCalledTimes(1)
  expect(server.invoke).toHaveBeenCalledWith({
    arguments: {
      endLine: 1,
      endOffset: 1,
      file: '/test/index.ts',
      startLine: 1,
      startOffset: 1,
    },
    command: TsServerCommandType.ToggleMultilineComment,
    seq: 1,
    type: TsServerMessageType.Request,
  })
})

test('toggleMultilineComment - error - no project', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: false,
        message: `No Project.`,
      }
    }),
  }
  await expect(
    TsServerRequests.toggleMultilineComment(server, {
      file: '/test/cat.ts',
      startLine: 1,
      startOffset: 1,
      endOffset: 1,
      endLine: 1,
    })
  ).rejects.toThrowError(
    new Error('TsServer.toggleMultilineComment failed to execute: No Project.')
  )
})

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
