import { jest } from '@jest/globals'

jest.unstable_mockModule('../src/parts/Id/Id.js', () => {
  return {
    create() {
      return 1
    },
  }
})

const TsServerRequests = await import(
  '../src/parts/TsServerRequestsToggleLineComment/TsServerRequestsToggleLineComment.js'
)

test('toggleLineComment', async () => {
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
            newText: '//',
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
    await TsServerRequests.toggleLineComment(server, {
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
      newText: '//',
      start: {
        line: 1,
        offset: 1,
      },
    },
  ])
})

test('toggleLineComment - error - no project', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: false,
        message: `No Project.`,
      }
    }),
  }
  await expect(
    TsServerRequests.toggleLineComment(server, {
      file: '/test/cat.ts',
      startLine: 1,
      startOffset: 1,
      endOffset: 1,
      endLine: 1,
    })
  ).rejects.toThrowError(
    new Error('TsServer.toggleLineComment failed to execute: No Project.')
  )
})
