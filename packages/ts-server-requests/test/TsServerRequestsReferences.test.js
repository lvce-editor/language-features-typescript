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
  '../src/parts/TsServerRequestsReferences/TsServerRequestReferences.js'
)

test('references', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: true,
        body: {
          refs: [
            {
              contextEnd: { line: 3, offset: 2 },
              contextStart: { line: 1, offset: 1 },
              end: { line: 1, offset: 10 },
              file: '/test/index.ts',
              isDefinition: true,
              isWriteAccess: true,
              lineText: 'const add = (a,b) => {',
              start: { line: 1, offset: 7 },
            },
            {
              end: { line: 5, offset: 4 },
              file: '/test/index.ts',
              isDefinition: false,
              isWriteAccess: false,
              lineText: 'add(1,2)',
              start: { line: 5, offset: 1 },
            },
            {
              end: { line: 6, offset: 4 },
              file: '/test/index.ts',
              isDefinition: false,
              isWriteAccess: false,
              lineText: 'add(3,4)',
              start: { line: 6, offset: 1 },
            },
          ],
          symbolDisplayString: 'const add: (a: any, b: any) => any',
          symbolName: 'add',
          symbolStartOffset: 7,
        },
      }
    }),
  }
  expect(
    await TsServerRequests.references(server, {
      file: '/test/index.ts',
      line: 1,
      offset: 7,
    })
  ).toEqual({
    refs: [
      {
        contextEnd: { line: 3, offset: 2 },
        contextStart: { line: 1, offset: 1 },
        end: { line: 1, offset: 10 },
        file: '/test/index.ts',
        isDefinition: true,
        isWriteAccess: true,
        lineText: 'const add = (a,b) => {',
        start: { line: 1, offset: 7 },
      },
      {
        end: { line: 5, offset: 4 },
        file: '/test/index.ts',
        isDefinition: false,
        isWriteAccess: false,
        lineText: 'add(1,2)',
        start: { line: 5, offset: 1 },
      },
      {
        end: { line: 6, offset: 4 },
        file: '/test/index.ts',
        isDefinition: false,
        isWriteAccess: false,
        lineText: 'add(3,4)',
        start: { line: 6, offset: 1 },
      },
    ],
    symbolDisplayString: 'const add: (a: any, b: any) => any',
    symbolName: 'add',
    symbolStartOffset: 7,
  })
  expect(server.invoke).toHaveBeenCalledTimes(1)
  expect(server.invoke).toHaveBeenCalledWith({
    arguments: {
      file: '/test/index.ts',
      line: 1,
      offset: 7,
    },
    command: TsServerCommandType.References,
    type: TsServerMessageType.Request,
  })
})
