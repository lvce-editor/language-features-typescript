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
    await TsServerRequests.completionInfo(server, {
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
    await TsServerRequests.completionInfo(server, {
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
