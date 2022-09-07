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
  '../src/parts/TsServerRequestsRename/TsServerRequestsRename.js'
)

test('rename - can rename', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: true,
        body: {
          info: {
            canRename: true,
            displayName: 'add',
            fullDisplayName: 'add',
            kind: 'const',
            kindModifiers: '',
            triggerSpan: {
              end: {
                line: 2,
                offset: 4,
              },
              start: {
                line: 2,
                offset: 1,
              },
            },
          },
          locs: [
            {
              file: '/test/index.ts',
              locs: [
                {
                  contextEnd: {
                    line: 1,
                    offset: 27,
                  },
                  contextStart: {
                    line: 1,
                    offset: 1,
                  },
                  end: {
                    line: 1,
                    offset: 10,
                  },
                  start: {
                    line: 1,
                    offset: 7,
                  },
                },
                {
                  end: {
                    line: 2,
                    offset: 4,
                  },
                  start: {
                    line: 2,
                    offset: 1,
                  },
                },
              ],
            },
          ],
        },
      }
    }),
  }
  expect(
    await TsServerRequests.rename(server, {
      file: '/test/index.ts',
      line: 2,
      offset: 2,
    })
  ).toEqual({
    info: {
      canRename: true,
      displayName: 'add',
      fullDisplayName: 'add',
      kind: 'const',
      kindModifiers: '',
      triggerSpan: {
        end: {
          line: 2,
          offset: 4,
        },
        start: {
          line: 2,
          offset: 1,
        },
      },
    },
    locs: [
      {
        file: '/test/index.ts',
        locs: [
          {
            contextEnd: {
              line: 1,
              offset: 27,
            },
            contextStart: {
              line: 1,
              offset: 1,
            },
            end: {
              line: 1,
              offset: 10,
            },
            start: {
              line: 1,
              offset: 7,
            },
          },
          {
            end: {
              line: 2,
              offset: 4,
            },
            start: {
              line: 2,
              offset: 1,
            },
          },
        ],
      },
    ],
  })
  expect(server.invoke).toHaveBeenCalledTimes(1)
  expect(server.invoke).toHaveBeenCalledWith({
    arguments: {
      file: '/test/index.ts',
      line: 2,
      offset: 2,
    },
    command: TsServerCommandType.Rename,
    type: TsServerMessageType.Request,
  })
})

test('rename - cannot rename', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: true,
        body: {
          info: {
            canRename: false,
            localizedErrorMessage: 'You cannot rename this element.',
          },
          locs: [],
        },
      }
    }),
  }
  expect(
    await TsServerRequests.rename(server, {
      file: '/test/index.ts',
      line: 1,
      offset: 2,
    })
  ).toEqual({
    info: {
      canRename: false,
      localizedErrorMessage: 'You cannot rename this element.',
    },
    locs: [],
  })
})

test('rename - error - cannot read properties of undefined', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: false,
        message: `TypeError: Cannot read properties of undefined (reading 'lineOffsetToPosition')`,
      }
    }),
  }
  await expect(
    TsServerRequests.rename(server, {
      file: '/test/cat.ts',
      line: 1,
      offset: 2,
    })
  ).rejects.toThrowError(
    new Error(
      `TsServer.rename failed to execute: TypeError: Cannot read properties of undefined (reading 'lineOffsetToPosition')`
    )
  )
})
