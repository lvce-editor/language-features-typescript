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
  '../src/parts/TsServerRequestsSemanticDiagnosticsSync/TsServerRequestsSemanticDiagnosticsSync.js'
)

test('semanticDiagnosticsSync', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: true,
        body: [
          {
            category: 'error',
            code: 2691,
            end: {
              line: 1,
              offset: 45,
            },
            start: {
              line: 1,
              offset: 29,
            },
            text: "An import path cannot end with a '.ts' extension. Consider importing './calculate' instead.",
          },
        ],
      }
    }),
  }
  expect(
    // @ts-ignore
    await TsServerRequests.semanticDiagnosticsSync(server, {
      file: '/test/index.ts',
    })
  ).toEqual([
    {
      category: 'error',
      code: 2691,
      end: {
        line: 1,
        offset: 45,
      },
      start: {
        line: 1,
        offset: 29,
      },
      text: "An import path cannot end with a '.ts' extension. Consider importing './calculate' instead.",
    },
  ])
  expect(server.invoke).toHaveBeenCalledTimes(1)
  expect(server.invoke).toHaveBeenCalledWith({
    arguments: {
      file: '/test/index.ts',
    },
    command: TsServerCommandType.SemanticDiagnosticsSync,
    seq: 1,
    type: TsServerMessageType.Request,
  })
})

test('semanticDiagnosticsSync - error - no project', async () => {
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
    TsServerRequests.semanticDiagnosticsSync(server, {
      file: '/test/cat.ts',
    })
  ).rejects.toThrowError(
    new Error('TsServer.semanticDiagnosticsSync failed to execute: No Project.')
  )
})
