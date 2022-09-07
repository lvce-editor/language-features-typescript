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
  '../src/parts/TsServerRequestsDocumentHighlights/TsServerRequestsDocumentHighlights.js'
)

test('documentHighlights', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: true,
        body: [
          {
            file: '/test/index.ts',
            highlightSpans: [
              {
                contextEnd: {
                  line: 1,
                  offset: 10,
                },
                contextStart: {
                  line: 1,
                  offset: 1,
                },
                end: {
                  line: 1,
                  offset: 6,
                },
                kind: 'writtenReference',
                start: {
                  line: 1,
                  offset: 5,
                },
              },
              {
                end: {
                  line: 2,
                  offset: 12,
                },
                kind: 'reference',
                start: {
                  line: 2,
                  offset: 11,
                },
              },
            ],
          },
        ],
      }
    }),
  }
  expect(
    // @ts-ignore
    await TsServerRequests.documentHighlights(server, {
      file: '/test/index.ts',
      line: 1,
      offset: 5,
      filesToSearch: ['/test/index.ts'],
    })
  ).toEqual([
    {
      file: '/test/index.ts',
      highlightSpans: [
        {
          contextEnd: {
            line: 1,
            offset: 10,
          },
          contextStart: {
            line: 1,
            offset: 1,
          },
          end: {
            line: 1,
            offset: 6,
          },
          kind: 'writtenReference',
          start: {
            line: 1,
            offset: 5,
          },
        },
        {
          end: {
            line: 2,
            offset: 12,
          },
          kind: 'reference',
          start: {
            line: 2,
            offset: 11,
          },
        },
      ],
    },
  ])
  expect(server.invoke).toHaveBeenCalledTimes(1)
  expect(server.invoke).toHaveBeenLastCalledWith({
    arguments: {
      file: '/test/index.ts',
      filesToSearch: ['/test/index.ts'],
      line: 1,
      offset: 5,
    },
    command: TsServerCommandType.DocumentHighlights,
    seq: 1,
    type: TsServerMessageType.Request,
  })
})

test('documentHighlights - tsServerError - debug failure', async () => {
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
    TsServerRequests.documentHighlights(server, {
      file: '/test/index.ts',
      line: 1,
      offset: 5,
      filesToSearch: ['**'],
    })
  ).rejects.toThrowError(
    'TsServer.documentHighlights failed to execute: Debug Failure. False expression.'
  )
})
