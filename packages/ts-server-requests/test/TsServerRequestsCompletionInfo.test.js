import { jest } from '@jest/globals'

jest.unstable_mockModule('../src/parts/Id/Id.js', () => {
  return {
    create() {
      return 1
    },
  }
})

const TsServerRequestsCompletionInfo = await import(
  '../src/parts/TsServerRequestsCompletionInfo/TsServerRequestsCompletionInfo.js'
)

test('completionInfo', async () => {
  const server = {
    invoke: jest.fn(() => {
      return {
        success: true,
        body: {
          entries: [
            {
              kind: 'keyword',
              kindModifiers: '',
              name: 'const',
              sortText: '15',
            },
          ],
          flags: 0,
          isGlobalCompletion: true,
          isMemberCompletion: false,
          isNewIdentifierLocation: false,
        },
      }
    }),
  }
  expect(
    // @ts-ignore
    await TsServerRequestsCompletionInfo.completionInfo(server, {
      file: '/test/index.ts',
      line: 1,
      offset: 2,
    })
  ).toEqual({
    entries: [
      {
        kind: 'keyword',
        kindModifiers: '',
        name: 'const',
        sortText: '15',
      },
    ],
    flags: 0,
    isGlobalCompletion: true,
    isMemberCompletion: false,
    isNewIdentifierLocation: false,
  })
})

test('completionInfo - property', async () => {
  const server = {
    invoke: jest.fn(() => {
      return {
        success: true,
        body: {
          entries: [
            {
              kind: 'method',
              kindModifiers: 'declare',
              name: 'addEventListener',
              sortText: '11',
            },
          ],
          flags: 0,
          isGlobalCompletion: false,
          isMemberCompletion: true,
          isNewIdentifierLocation: false,
          optionalReplacementSpan: {
            end: {
              line: 1,
              offset: 11,
            },
            start: {
              line: 1,
              offset: 8,
            },
          },
        },
      }
    }),
  }
  expect(
    // @ts-ignore
    await TsServerRequestsCompletionInfo.completionInfo(server, {
      file: '/test/index.ts',
      line: 1,
      offset: 11,
      prefix: 'add',
    })
  ).toEqual({
    entries: [
      {
        kind: 'method',
        kindModifiers: 'declare',
        name: 'addEventListener',
        sortText: '11',
      },
    ],
    flags: 0,
    isGlobalCompletion: false,
    isMemberCompletion: true,
    isNewIdentifierLocation: false,
    optionalReplacementSpan: {
      end: {
        line: 1,
        offset: 11,
      },
      start: {
        line: 1,
        offset: 8,
      },
    },
  })
})

test('completionInfo - tsServerError - no project', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: false,
        message: 'No Project.',
      }
    }),
  }
  await expect(
    // @ts-ignore
    TsServerRequestsCompletionInfo.completionInfo(server, {
      file: '/test/index.ts',
      line: 0,
      offset: 0,
    })
  ).rejects.toThrowError(
    new Error('TsServer.completionInfo failed to execute: No Project.')
  )
})
