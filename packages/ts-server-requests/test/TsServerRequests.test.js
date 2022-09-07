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
