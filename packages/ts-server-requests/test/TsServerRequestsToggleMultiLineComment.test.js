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
  '../src/parts/TsServerRequestsToggleMultiLineComment/TsServerRequestsToggleMultiLineComment.js'
)

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
