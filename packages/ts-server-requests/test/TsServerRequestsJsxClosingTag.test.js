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
  '../src/parts/TsServerRequestsJsxClosingTag/TsServerRequestsJsxClosingTag.js'
)

test('jsxClosingTag', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: true,
        body: {
          caretOffset: 0,
          newText: '</div>',
        },
      }
    }),
  }
  expect(
    await TsServerRequests.jsxClosingTag(server, {
      file: '/test/index.tsx',
      line: 2,
      offset: 15,
    })
  ).toEqual({
    caretOffset: 0,
    newText: '</div>',
  })
  expect(server.invoke).toHaveBeenCalledTimes(1)
  expect(server.invoke).toHaveBeenCalledWith({
    arguments: {
      file: '/test/index.tsx',
      line: 2,
      offset: 15,
    },
    command: TsServerCommandType.JsxClosingTag,
    seq: 1,
    type: TsServerMessageType.Request,
  })
})
