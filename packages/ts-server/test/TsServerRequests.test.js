import { jest } from '@jest/globals'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

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
    command: 'braceCompletion',
    seq: 1,
    type: 'request',
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
    command: 'definition',
    seq: 1,
    type: 'request',
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
    command: 'documentHighlights',
    seq: 1,
    type: 'request',
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
    command: 'encodedSemanticClassifications-full',
    seq: 1,
    type: 'request',
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
    command: 'exit',
    type: 'request',
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
    command: 'fileReferences',
    seq: 1,
    type: 'request',
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
    command: 'indentation',
    seq: 1,
    type: 'request',
  })
})

test.skip('jsxClosingTag', async () => {
  const tmpDir = await getTmpDir()
  await writeFile(join(tmpDir, 'tsconfig.json'), DEFAULT_TSCONFIG)
  await TsServerRequests.updateOpen({
    openFiles: [
      {
        file: join(tmpDir, 'index.tsx'),
        fileContent: `const button = () => {
  return <div
}
`,
        projectRootPath: tmpDir,
        scriptKindName: 'TSX',
      },
    ],
  })
  await TsServerRequests.updateOpen({
    changedFiles: [
      {
        fileName: join(tmpDir, 'index.tsx'),
        textChanges: [
          {
            newText: '>',
            start: {
              line: 2,
              offset: 14,
            },
            end: {
              line: 2,
              offset: 14,
            },
          },
        ],
      },
    ],
  })
  expect(
    await TsServerRequests.jsxClosingTag({
      file: join(tmpDir, 'index.tsx'),
      line: 2,
      offset: 15,
    })
  ).toEqual({
    caretOffset: 0,
    newText: '</div>',
  })
})

test.skip('jsxClosingTag - when typing slash', async () => {
  const tmpDir = await getTmpDir()
  await writeFile(join(tmpDir, 'tsconfig.json'), DEFAULT_TSCONFIG)
  await TsServerRequests.updateOpen({
    openFiles: [
      {
        file: join(tmpDir, 'index.tsx'),
        fileContent: `const button = () => {
  return <div><
}
`,
        projectRootPath: tmpDir,
        scriptKindName: 'TSX',
      },
    ],
  })
  await TsServerRequests.updateOpen({
    changedFiles: [
      {
        fileName: join(tmpDir, 'index.tsx'),
        textChanges: [
          {
            newText: '/',
            start: {
              line: 2,
              offset: 16,
            },
            end: {
              line: 2,
              offset: 16,
            },
          },
        ],
      },
    ],
  })
  expect(
    await TsServerRequests.jsxClosingTag({
      file: join(tmpDir, 'index.tsx'),
      line: 2,
      offset: 17,
    })
  ).toBeUndefined()
})

test.skip('organizeImports', async () => {
  const tmpDir = await getTmpDir()
  await writeFile(
    join(tmpDir, 'index.ts'),
    `import {add, subtract} from './calculate.ts'
add(1, 2)`
  )
  await writeFile(
    join(tmpDir, 'calculate.ts'),
    `export const add = (a,b) => a + b'
export const subtract = (a,b) => a - b`
  )
  await writeFile(join(tmpDir, 'tsconfig.json'), DEFAULT_TSCONFIG)
  await TsServerRequests.updateOpen({
    openFiles: [
      {
        file: join(tmpDir, 'index.ts'),
      },
    ],
  })
  expect(
    await TsServerRequests.organizeImports({
      scope: {
        type: 'file',
        args: {
          file: join(tmpDir, 'index.ts'),
        },
      },
    })
  ).toEqual([
    {
      fileName: normalize(join(tmpDir, 'index.ts')),
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

test.skip('organizeImports - error - no project', async () => {
  const tmpDir = await getTmpDir()
  await writeFile(
    join(tmpDir, 'index.ts'),
    `import {add, subtract} from './calculate.ts'
add(1, 2)`
  )
  await writeFile(
    join(tmpDir, 'calculate.ts'),
    `export const add = (a,b) => a + b'
export const subtract = (a,b) => a - b`
  )
  await writeFile(join(tmpDir, 'tsconfig.json'), DEFAULT_TSCONFIG)
  await TsServerRequests.updateOpen({
    openFiles: [
      {
        file: join(tmpDir, 'index.ts'),
      },
    ],
  })
  await expect(
    TsServerRequests.organizeImports({
      scope: {
        type: 'file',
        args: {
          file: join(tmpDir, 'cat.ts'),
        },
      },
    })
  ).rejects.toThrowError(
    new Error('TsServer.organizeImports failed to execute: No Project.')
  )
})

test.skip('references', async () => {
  const tmpDir = await getTmpDir()
  await writeFile(
    join(tmpDir, 'index.ts'),
    `const add = (a,b) => {
  return a + b
}

add(1,2)
add(3,4)
`
  )
  await writeFile(join(tmpDir, 'tsconfig.json'), DEFAULT_TSCONFIG)
  await TsServerRequests.updateOpen({
    openFiles: [
      {
        file: join(tmpDir, 'index.ts'),
      },
    ],
  })
  expect(
    await TsServerRequests.references({
      file: join(tmpDir, 'index.ts'),
      line: 1,
      offset: 7,
    })
  ).toEqual({
    refs: [
      {
        contextEnd: { line: 3, offset: 2 },
        contextStart: { line: 1, offset: 1 },
        end: { line: 1, offset: 10 },
        file: fixPath(join(tmpDir, 'index.ts')),
        isDefinition: true,
        isWriteAccess: true,
        lineText: 'const add = (a,b) => {',
        start: { line: 1, offset: 7 },
      },
      {
        end: { line: 5, offset: 4 },
        file: fixPath(join(tmpDir, 'index.ts')),
        isDefinition: false,
        isWriteAccess: false,
        lineText: 'add(1,2)',
        start: { line: 5, offset: 1 },
      },
      {
        end: { line: 6, offset: 4 },
        file: fixPath(join(tmpDir, 'index.ts')),
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
})

test.skip('rename - can rename', async () => {
  const tmpDir = await getTmpDir()
  await writeFile(
    join(tmpDir, 'index.ts'),
    `const add = (a,b) => a + b'
add(1,2)`
  )
  await writeFile(join(tmpDir, 'tsconfig.json'), DEFAULT_TSCONFIG)
  await TsServerRequests.updateOpen({
    openFiles: [
      {
        file: join(tmpDir, 'index.ts'),
      },
    ],
  })
  expect(
    await TsServerRequests.rename({
      file: join(tmpDir, 'index.ts'),
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
        file: normalize(join(tmpDir, 'index.ts')),
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
})

test.skip('rename - cannot rename', async () => {
  const tmpDir = await getTmpDir()
  await writeFile(
    join(tmpDir, 'index.ts'),
    "export const add = (a,b) => a + b'"
  )
  await writeFile(join(tmpDir, 'tsconfig.json'), DEFAULT_TSCONFIG)
  await TsServerRequests.updateOpen({
    openFiles: [
      {
        file: join(tmpDir, 'index.ts'),
      },
    ],
  })
  expect(
    await TsServerRequests.rename({
      file: join(tmpDir, 'index.ts'),
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

test.skip('rename - error - cannot read properties of undefined', async () => {
  const tmpDir = await getTmpDir()
  await writeFile(
    join(tmpDir, 'index.ts'),
    "export const add = (a,b) => a + b'"
  )
  await writeFile(join(tmpDir, 'tsconfig.json'), DEFAULT_TSCONFIG)
  await TsServerRequests.updateOpen({
    openFiles: [
      {
        file: join(tmpDir, 'index.ts'),
      },
    ],
  })
  await expect(
    TsServerRequests.rename({
      file: join(tmpDir, 'cat.ts'),
      line: 1,
      offset: 2,
    })
  ).rejects.toThrowError(
    new Error(
      `TsServer.rename failed to execute: TypeError: Cannot read properties of undefined (reading 'lineOffsetToPosition')`
    )
  )
})

test.skip('semanticDiagnosticsSync', async () => {
  const tmpDir = await getTmpDir()
  await writeFile(
    join(tmpDir, 'index.ts'),
    `import {add, subtract} from './calculate.ts'
add(1, 2)`
  )
  await writeFile(join(tmpDir, 'tsconfig.json'), DEFAULT_TSCONFIG)
  await TsServerRequests.updateOpen({
    openFiles: [
      {
        file: join(tmpDir, 'index.ts'),
      },
    ],
  })
  expect(
    await TsServerRequests.semanticDiagnosticsSync({
      file: join(tmpDir, 'index.ts'),
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
})

test.skip('semanticDiagnosticsSync - error - no project', async () => {
  const tmpDir = await getTmpDir()
  await writeFile(
    join(tmpDir, 'index.ts'),
    `import {add, subtract} from './calculate.ts'
add(1, 2)`
  )
  await writeFile(join(tmpDir, 'tsconfig.json'), DEFAULT_TSCONFIG)
  await TsServerRequests.updateOpen({
    openFiles: [
      {
        file: join(tmpDir, 'index.ts'),
      },
    ],
  })
  await expect(
    TsServerRequests.semanticDiagnosticsSync({
      file: join(tmpDir, 'cat.ts'),
    })
  ).rejects.toThrowError(
    new Error('TsServer.semanticDiagnosticsSync failed to execute: No Project.')
  )
})

test.skip('toggleLineComment', async () => {
  const tmpDir = await getTmpDir()
  await writeFile(
    join(tmpDir, 'index.ts'),
    `let x = 1
`
  )
  await writeFile(join(tmpDir, 'tsconfig.json'), DEFAULT_TSCONFIG)
  await TsServerRequests.updateOpen({
    openFiles: [
      {
        file: join(tmpDir, 'index.ts'),
      },
    ],
  })
  expect(
    await TsServerRequests.toggleLineComment({
      file: join(tmpDir, 'index.ts'),
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

test.skip('toggleLineComment - error - no project', async () => {
  const tmpDir = await getTmpDir()
  await writeFile(
    join(tmpDir, 'index.ts'),
    `let x = 1
`
  )
  await writeFile(join(tmpDir, 'tsconfig.json'), DEFAULT_TSCONFIG)
  await TsServerRequests.updateOpen({
    openFiles: [
      {
        file: join(tmpDir, 'index.ts'),
      },
    ],
  })
  await expect(
    TsServerRequests.toggleLineComment({
      file: join(tmpDir, 'cat.ts'),
      startLine: 1,
      startOffset: 1,
      endOffset: 1,
      endLine: 1,
    })
  ).rejects.toThrowError(
    new Error('TsServer.toggleLineComment failed to execute: No Project.')
  )
})

test.skip('toggleMultilineComment', async () => {
  const tmpDir = await getTmpDir()
  await writeFile(
    join(tmpDir, 'index.ts'),
    `let x = 1
`
  )
  await writeFile(join(tmpDir, 'tsconfig.json'), DEFAULT_TSCONFIG)
  await TsServerRequests.updateOpen({
    openFiles: [
      {
        file: join(tmpDir, 'index.ts'),
      },
    ],
  })
  expect(
    await TsServerRequests.toggleMultilineComment({
      file: join(tmpDir, 'index.ts'),
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
})

test.skip('toggleMultilineComment - error - no project', async () => {
  const tmpDir = await getTmpDir()
  await writeFile(
    join(tmpDir, 'index.ts'),
    `let x = 1
`
  )
  await writeFile(join(tmpDir, 'tsconfig.json'), DEFAULT_TSCONFIG)
  await TsServerRequests.updateOpen({
    openFiles: [
      {
        file: join(tmpDir, 'index.ts'),
      },
    ],
  })
  await expect(
    TsServerRequests.toggleMultilineComment({
      file: join(tmpDir, 'cat.ts'),
      startLine: 1,
      startOffset: 1,
      endOffset: 1,
      endLine: 1,
    })
  ).rejects.toThrowError(
    new Error('TsServer.toggleMultiLineComment failed to execute: No Project.')
  )
})

// TODO should find test case that returns actual result
test.skip('typeDefinition - no result', async () => {
  const tmpDir = await getTmpDir()
  await writeFile(
    join(tmpDir, 'index.ts'),
    `type X = number
let x : X = 11
const y = x`
  )
  await writeFile(join(tmpDir, 'tsconfig.json'), DEFAULT_TSCONFIG)
  await TsServerRequests.updateOpen({
    openFiles: [
      {
        file: join(tmpDir, 'index.ts'),
      },
    ],
  })
  expect(
    await TsServerRequests.typeDefinition({
      file: join(tmpDir, 'index.ts'),
      line: 3,
      offset: 6,
    })
  ).toEqual([])
})

test.skip('typeDefinition - error - no project', async () => {
  const tmpDir = await getTmpDir()
  await writeFile(
    join(tmpDir, 'index.ts'),
    `type X = number
let x : X = 11
const y = x`
  )
  await writeFile(join(tmpDir, 'tsconfig.json'), DEFAULT_TSCONFIG)
  await TsServerRequests.updateOpen({
    openFiles: [
      {
        file: join(tmpDir, 'index.ts'),
      },
    ],
  })
  await expect(
    TsServerRequests.typeDefinition({
      file: join(tmpDir, 'cat.ts'),
      line: 3,
      offset: 6,
    })
  ).rejects.toThrowError(
    new Error('TsServer.typeDefinition failed to execute: No Project.')
  )
})

test.skip('updateOpen - issue with textChanges', async () => {
  const tmpDir = await getTmpDir()
  await writeFile(join(tmpDir, 'index.ts'), '{')
  await writeFile(join(tmpDir, 'tsconfig.json'), DEFAULT_TSCONFIG)
  await TsServerRequests.updateOpen({
    openFiles: [
      {
        file: join(tmpDir, 'index.ts'),
        fileContent: `const add = (a: number, b: number) => {\n  return a + b;\n}`,
      },
    ],
  })
  expect(
    await TsServerRequests.updateOpen({
      changedFiles: [
        {
          fileName: join(tmpDir, 'index.ts'),
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
})
