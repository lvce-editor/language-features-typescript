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

test('braceCompletion', async () => {
  const server = {
    invoke: jest.fn(() => {
      return {
        success: true,
        body: true,
      }
    }),
  }
  expect(
    await TsServerRequests.braceCompletion(server, {
      file: '/test/index.ts',
      line: 1,
      offset: 2,
      openingBrace: '{',
    })
  ).toBe(true)
  expect(server.invoke).toHaveBeenCalledTimes(1)
  expect(server.invoke).toHaveBeenCalledWith({
    arguments: {
      file: '/test/index.ts',
      line: 1,
      offset: 2,
      openingBrace: '{',
    },
    command: TsServerCommandType.BraceCompletion,
    seq: 1,
    type: TsServerMessageType.Request,
  })
})

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

test('completionDetails - property', async () => {
  const server = {
    invoke: jest.fn(() => {
      return {
        success: true,
        body: [
          {
            displayParts: [
              { kind: 'punctuation', text: '(' },
              { kind: 'text', text: 'method' },
              { kind: 'punctuation', text: ')' },
              { kind: 'space', text: ' ' },
              { kind: 'propertyName', text: 'addEventListener' },
              { kind: 'punctuation', text: '<' },
              { kind: 'typeParameterName', text: 'K' },
              { kind: 'space', text: ' ' },
              { kind: 'keyword', text: 'extends' },
              { kind: 'space', text: ' ' },
              { kind: 'keyword', text: 'keyof' },
              { kind: 'space', text: ' ' },
              { kind: 'interfaceName', text: 'WindowEventMap' },
              { kind: 'punctuation', text: '>' },
              { kind: 'punctuation', text: '(' },
              { kind: 'parameterName', text: 'type' },
              { kind: 'punctuation', text: ':' },
              { kind: 'space', text: ' ' },
              { kind: 'typeParameterName', text: 'K' },
              { kind: 'punctuation', text: ',' },
              { kind: 'space', text: ' ' },
              { kind: 'parameterName', text: 'listener' },
              { kind: 'punctuation', text: ':' },
              { kind: 'space', text: ' ' },
              { kind: 'punctuation', text: '(' },
              { kind: 'parameterName', text: 'this' },
              { kind: 'punctuation', text: ':' },
              { kind: 'space', text: ' ' },
              { kind: 'localName', text: 'Window' },
              { kind: 'punctuation', text: ',' },
              { kind: 'space', text: ' ' },
              { kind: 'parameterName', text: 'ev' },
              { kind: 'punctuation', text: ':' },
              { kind: 'space', text: ' ' },
              { kind: 'interfaceName', text: 'WindowEventMap' },
              { kind: 'punctuation', text: '[' },
              { kind: 'typeParameterName', text: 'K' },
              { kind: 'punctuation', text: ']' },
              { kind: 'punctuation', text: ')' },
              { kind: 'space', text: ' ' },
              { kind: 'punctuation', text: '=>' },
              { kind: 'space', text: ' ' },
              { kind: 'keyword', text: 'any' },
              { kind: 'punctuation', text: ',' },
              { kind: 'space', text: ' ' },
              { kind: 'parameterName', text: 'options' },
              { kind: 'punctuation', text: '?' },
              { kind: 'punctuation', text: ':' },
              { kind: 'space', text: ' ' },
              { kind: 'keyword', text: 'boolean' },
              { kind: 'space', text: ' ' },
              { kind: 'punctuation', text: '|' },
              { kind: 'space', text: ' ' },
              { kind: 'interfaceName', text: 'AddEventListenerOptions' },
              { kind: 'punctuation', text: ')' },
              { kind: 'punctuation', text: ':' },
              { kind: 'space', text: ' ' },
              { kind: 'keyword', text: 'void' },
              { kind: 'space', text: ' ' },
              { kind: 'punctuation', text: '(' },
              { kind: 'operator', text: '+' },
              { kind: 'numericLiteral', text: '1' },
              { kind: 'space', text: ' ' },
              { kind: 'text', text: 'overload' },
              { kind: 'punctuation', text: ')' },
            ],
            documentation: [
              {
                kind: 'text',
                text: `Appends an event listener for events whose type attribute value is type. The callback argument sets the callback that will be invoked when the event is dispatched.

The options argument sets listener-specific options. For compatibility this can be a boolean, in which case the method behaves exactly as if the value was specified as options's capture.

When set to true, options's capture prevents callback from being invoked when the event's eventPhase attribute value is BUBBLING_PHASE. When false (or not present), callback will not be invoked when event's eventPhase attribute value is CAPTURING_PHASE. Either way, callback will be invoked if event's eventPhase attribute value is AT_TARGET.

When set to true, options's passive indicates that the callback will not cancel the event by invoking preventDefault(). This is used to enable performance optimizations described in § 2.8 Observing event listeners.

When set to true, options's once indicates that the callback will only be invoked once after which the event listener will be removed.

If an AbortSignal is passed for options's signal, then the event listener will be removed when signal is aborted.

The event listener is appended to target's event listener list and is not appended if it has the same type, callback, and capture.`,
              },
            ],
            kind: 'method',
            kindModifiers: 'declare',
            name: 'addEventListener',
            tags: [],
          },
        ],
      }
    }),
  }
  expect(
    await TsServerRequests.completionDetails(server, {
      file: '/test/index.ts',
      entryNames: [
        {
          name: 'addEventListener',
        },
      ],
      line: 1,
      offset: 11,
    })
  ).toEqual([
    {
      displayParts: [
        { kind: 'punctuation', text: '(' },
        { kind: 'text', text: 'method' },
        { kind: 'punctuation', text: ')' },
        { kind: 'space', text: ' ' },
        { kind: 'propertyName', text: 'addEventListener' },
        { kind: 'punctuation', text: '<' },
        { kind: 'typeParameterName', text: 'K' },
        { kind: 'space', text: ' ' },
        { kind: 'keyword', text: 'extends' },
        { kind: 'space', text: ' ' },
        { kind: 'keyword', text: 'keyof' },
        { kind: 'space', text: ' ' },
        { kind: 'interfaceName', text: 'WindowEventMap' },
        { kind: 'punctuation', text: '>' },
        { kind: 'punctuation', text: '(' },
        { kind: 'parameterName', text: 'type' },
        { kind: 'punctuation', text: ':' },
        { kind: 'space', text: ' ' },
        { kind: 'typeParameterName', text: 'K' },
        { kind: 'punctuation', text: ',' },
        { kind: 'space', text: ' ' },
        { kind: 'parameterName', text: 'listener' },
        { kind: 'punctuation', text: ':' },
        { kind: 'space', text: ' ' },
        { kind: 'punctuation', text: '(' },
        { kind: 'parameterName', text: 'this' },
        { kind: 'punctuation', text: ':' },
        { kind: 'space', text: ' ' },
        { kind: 'localName', text: 'Window' },
        { kind: 'punctuation', text: ',' },
        { kind: 'space', text: ' ' },
        { kind: 'parameterName', text: 'ev' },
        { kind: 'punctuation', text: ':' },
        { kind: 'space', text: ' ' },
        { kind: 'interfaceName', text: 'WindowEventMap' },
        { kind: 'punctuation', text: '[' },
        { kind: 'typeParameterName', text: 'K' },
        { kind: 'punctuation', text: ']' },
        { kind: 'punctuation', text: ')' },
        { kind: 'space', text: ' ' },
        { kind: 'punctuation', text: '=>' },
        { kind: 'space', text: ' ' },
        { kind: 'keyword', text: 'any' },
        { kind: 'punctuation', text: ',' },
        { kind: 'space', text: ' ' },
        { kind: 'parameterName', text: 'options' },
        { kind: 'punctuation', text: '?' },
        { kind: 'punctuation', text: ':' },
        { kind: 'space', text: ' ' },
        { kind: 'keyword', text: 'boolean' },
        { kind: 'space', text: ' ' },
        { kind: 'punctuation', text: '|' },
        { kind: 'space', text: ' ' },
        { kind: 'interfaceName', text: 'AddEventListenerOptions' },
        { kind: 'punctuation', text: ')' },
        { kind: 'punctuation', text: ':' },
        { kind: 'space', text: ' ' },
        { kind: 'keyword', text: 'void' },
        { kind: 'space', text: ' ' },
        { kind: 'punctuation', text: '(' },
        { kind: 'operator', text: '+' },
        { kind: 'numericLiteral', text: '1' },
        { kind: 'space', text: ' ' },
        { kind: 'text', text: 'overload' },
        { kind: 'punctuation', text: ')' },
      ],
      documentation: [
        {
          kind: 'text',
          text: `Appends an event listener for events whose type attribute value is type. The callback argument sets the callback that will be invoked when the event is dispatched.

The options argument sets listener-specific options. For compatibility this can be a boolean, in which case the method behaves exactly as if the value was specified as options's capture.

When set to true, options's capture prevents callback from being invoked when the event's eventPhase attribute value is BUBBLING_PHASE. When false (or not present), callback will not be invoked when event's eventPhase attribute value is CAPTURING_PHASE. Either way, callback will be invoked if event's eventPhase attribute value is AT_TARGET.

When set to true, options's passive indicates that the callback will not cancel the event by invoking preventDefault(). This is used to enable performance optimizations described in § 2.8 Observing event listeners.

When set to true, options's once indicates that the callback will only be invoked once after which the event listener will be removed.

If an AbortSignal is passed for options's signal, then the event listener will be removed when signal is aborted.

The event listener is appended to target's event listener list and is not appended if it has the same type, callback, and capture.`,
        },
      ],
      kind: 'method',
      kindModifiers: 'declare',
      name: 'addEventListener',
      tags: [],
    },
  ])
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
    TsServerRequests.completionInfo(server, {
      file: '/test/index.ts',
      line: 0,
      offset: 0,
    })
  ).rejects.toThrowError(
    new Error('TsServer.completionInfo failed to execute: No Project.')
  )
})

test('definition', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: true,
        body: [
          {
            contextEnd: { line: 2, offset: 12 },
            contextStart: { line: 2, offset: 1 },
            end: { line: 2, offset: 8 },
            file: '/test/index.ts',
            start: { line: 2, offset: 7 },
          },
        ],
      }
    }),
  }
  expect(
    await TsServerRequests.definition(server, {
      file: '/test/index.ts',
      line: 2,
      offset: 7,
    })
  ).toEqual([
    {
      contextEnd: { line: 2, offset: 12 },
      contextStart: { line: 2, offset: 1 },
      end: { line: 2, offset: 8 },
      file: '/test/index.ts',
      start: { line: 2, offset: 7 },
    },
  ])
  expect(server.invoke).toHaveBeenCalledTimes(1)
  expect(server.invoke).toHaveBeenCalledWith({
    arguments: {
      file: '/test/index.ts',
      line: 2,
      offset: 7,
    },
    command: TsServerCommandType.Definition,
    seq: 1,
    type: TsServerMessageType.Request,
  })
})

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

test('encodedSemanticClassificationsFull', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: true,
        body: {
          endOfLineState: 0,
          // prettier-ignore
          spans: [
            4 /* offset */,
            1 /* length */,
            2049 /* (2049 >> 8) - 1 = 7 = variable, 2049 & 255 = 1 = 2^0 = declaration  */,

            16 /* offset */,
            1 /* length */,
            2057 /* (2057 >> 8) - 1 = 7 = variable, 2057 & 255 = 9 = 2^3 + 2^0 = declaration and readonly */,

            20 /* offset */,
            1 /* length */,
            2048 /* (2048 >> 8) - 1 = 7 = variable, 2048 & 255 = 0 = none */,
          ],
        },
      }
    }),
  }
  expect(
    await TsServerRequests.encodedSemanticClassificationsFull(server, {
      file: '/test/index.ts',
      format: '2020',
      start: 0,
      length: 21,
    })
  ).toEqual({
    endOfLineState: 0,
    // prettier-ignore
    spans: [
        4 /* offset */,
        1 /* length */,
        2049 /* (2049 >> 8) - 1 = 7 = variable, 2049 & 255 = 1 = 2^0 = declaration  */,

        16 /* offset */,
        1 /* length */,
        2057 /* (2057 >> 8) - 1 = 7 = variable, 2057 & 255 = 9 = 2^3 + 2^0 = declaration and readonly */,

        20 /* offset */,
        1 /* length */,
        2048 /* (2048 >> 8) - 1 = 7 = variable, 2048 & 255 = 0 = none */,
      ],
  })
  expect(server.invoke).toHaveBeenCalledTimes(1)
  expect(server.invoke).toHaveBeenCalledWith({
    arguments: {
      file: '/test/index.ts',
      format: '2020',
      length: 21,
      start: 0,
    },
    command: TsServerCommandType.EncodedSemanticClassificationsFull,
    seq: 1,
    type: TsServerMessageType.Request,
  })
})

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

test('fileReferences', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: true,
        body: {
          refs: [], // TODO should find reference to index.ts file
          symbolName: `"/test/calculate.ts"`,
        },
      }
    }),
  }
  expect(
    await TsServerRequests.fileReferences(server, {
      file: '/test/calculate.ts',
    })
  ).toEqual({
    refs: [], // TODO should find reference to index.ts file
    symbolName: `"/test/calculate.ts"`,
  })
  expect(server.invoke).toHaveBeenCalledTimes(1)
  expect(server.invoke).toHaveBeenCalledWith({
    arguments: {
      file: '/test/calculate.ts',
    },
    command: TsServerCommandType.FileReferences,
    seq: 1,
    type: TsServerMessageType.Request,
  })
})

test('fileReferences - error - debug failure', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: false,
        message: `Debug Failure. False expression.`,
      }
    }),
  }
  await expect(
    TsServerRequests.fileReferences(server, {
      file: '/test/calculate.ts',
    })
  ).rejects.toThrowError(
    new Error(
      'TsServer.fileReferences failed to execute: Debug Failure. False expression.'
    )
  )
})

test('fileReferences - tsServerError - no project', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: false,
        message: `No Project.`,
      }
    }),
  }
  await expect(
    TsServerRequests.fileReferences(server, {
      file: '/test/cat.ts',
    })
  ).rejects.toThrowError(
    new Error('TsServer.fileReferences failed to execute: No Project.')
  )
})

test('implementation', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: true,
        body: [
          {
            contextEnd: { line: 1, offset: 28 },
            contextStart: { line: 1, offset: 1 },
            end: { line: 1, offset: 10 },
            file: '/test/index.ts',
            start: { line: 1, offset: 7 },
          },
        ],
      }
    }),
  }
  expect(
    await TsServerRequests.implementation(server, {
      file: '/test/index.ts',
      line: 2,
      offset: 14,
    })
  ).toEqual([
    {
      contextEnd: { line: 1, offset: 28 },
      contextStart: { line: 1, offset: 1 },
      end: { line: 1, offset: 10 },
      file: '/test/index.ts',
      start: { line: 1, offset: 7 },
    },
  ])
})

test('implementation - error - no project', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: false,
        message: `No Project.`,
      }
    }),
  }
  await expect(
    TsServerRequests.implementation(server, {
      file: '/test/cat.ts',
      line: 2,
      offset: 14,
    })
  ).rejects.toThrowError(
    new Error('TsServer.implementation failed to execute: No Project.')
  )
})

test('indentation', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: true,
        body: { indentation: 2, position: 9 },
      }
    }),
  }
  expect(
    await TsServerRequests.indentation(server, {
      file: '/test/index.ts',
      line: 1,
      offset: 10,
    })
  ).toEqual({ indentation: 2, position: 9 })
  expect(server.invoke).toHaveBeenCalledTimes(1)
  expect(server.invoke).toHaveBeenCalledWith({
    arguments: {
      file: '/test/index.ts',
      line: 1,
      offset: 10,
    },
    command: TsServerCommandType.Indentation,
    seq: 1,
    type: TsServerMessageType.Request,
  })
})

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

test('jsxClosingTag - when typing slash', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: true,
        body: undefined,
      }
    }),
  }
  expect(
    await TsServerRequests.jsxClosingTag(server, {
      file: '/test/index.tsx',
      line: 2,
      offset: 17,
    })
  ).toBeUndefined()
})

test('organizeImports', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: true,
        body: [
          {
            fileName: '/test/index.ts',
            textChanges: [
              {
                end: { line: 2, offset: 1 },
                newText:
                  process.platform === 'win32'
                    ? "import { add } from './calculate.ts'\r\n"
                    : "import { add } from './calculate.ts'\n",
                start: { line: 1, offset: 1 },
              },
            ],
          },
        ],
      }
    }),
  }
  expect(
    await TsServerRequests.organizeImports(server, {
      scope: {
        type: 'file',
        args: {
          file: '/test/index.ts',
        },
      },
    })
  ).toEqual([
    {
      fileName: '/test/index.ts',
      textChanges: [
        {
          end: { line: 2, offset: 1 },
          newText:
            process.platform === 'win32'
              ? "import { add } from './calculate.ts'\r\n"
              : "import { add } from './calculate.ts'\n",
          start: { line: 1, offset: 1 },
        },
      ],
    },
  ])
})

test('organizeImports - error - no project', async () => {
  const server = {
    invoke: jest.fn(async () => {
      return {
        success: false,
        message: `No Project.`,
      }
    }),
  }
  await expect(
    TsServerRequests.organizeImports(server, {
      scope: {
        type: 'file',
        args: {
          file: '/test/cat.ts',
        },
      },
    })
  ).rejects.toThrowError(
    new Error('TsServer.organizeImports failed to execute: No Project.')
  )
})

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
    TsServerRequests.semanticDiagnosticsSync(server, {
      file: '/test/cat.ts',
    })
  ).rejects.toThrowError(
    new Error('TsServer.semanticDiagnosticsSync failed to execute: No Project.')
  )
})

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
