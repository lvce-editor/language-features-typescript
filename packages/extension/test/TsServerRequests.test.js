import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import normalize from 'normalize-path'
import * as TsServerRequests from '../src/parts/TsServerRequests/TsServerRequests.js'
import * as TsPrimaryServer from '../src/parts/TsPrimaryServer/TsPrimaryServer.js'
// TODO not sure whether normalized paths are also needed elsewhere, might be the case
import * as Callback from '../src/parts/Callback/Callback.js'
import * as Platform from '../src/parts/Platform/Platform.js'
import * as TsServerIpcType from '../src/parts/TsServerIpcType/TsServerIpcType.js'

const getTmpDir = () => {
  return mkdtemp(join(tmpdir(), 'foo-'))
}

const DEFAULT_TSCONFIG = `{
  "moduleResolution": "node",
  "newLine": "lf",
  "skipLibCheck": true,
  "skipDefaultLibCheck": true,
  "rootDir": "."
}
`

const TS_SERVER_CONFIGURE_TIMEOUT = 45_000
const TS_SERVER_TEST_TIMEOUT = 15_000

/**
 * @param {string} path
 */
const fixPath = (path) => {
  return path.replaceAll('\\', '/')
}

// TODO maybe it would be possible to use one server for all tests to speed up tests
// but tests should still not influence each other

beforeEach(async () => {
  Callback.state.pending = Object.create(null)
  TsPrimaryServer.start({
    tsServerPath: Platform.getDefaultTsServerPath(),
    ipc: TsServerIpcType.NodeIpc,
  })
  await TsServerRequests.configure({
    hostInfo: 'test',
  })
}, /* this can take some time */ TS_SERVER_CONFIGURE_TIMEOUT)

afterEach(() => {
  Callback.state.pending = Object.create(null)
  TsPrimaryServer.stop()
})

// TODO test errors

test.only(
  'braceCompletion',
  async () => {
    const tmpDir = await getTmpDir()
    await writeFile(join(tmpDir, 'index.ts'), '{')
    await writeFile(join(tmpDir, 'tsconfig.json'), DEFAULT_TSCONFIG)
    await TsServerRequests.updateOpen({
      openFiles: [
        {
          file: join(tmpDir, 'index.ts'),
        },
      ],
    })
    expect(
      await TsServerRequests.braceCompletion({
        file: join(tmpDir, 'index.ts'),
        line: 1,
        offset: 2,
        openingBrace: '{',
      })
    ).toBe(true)
  },
  /* this can take some time */ TS_SERVER_TEST_TIMEOUT
)

test(
  'braceCompletion - javascript',
  async () => {
    const tmpDir = await getTmpDir()
    await writeFile(join(tmpDir, 'index.js'), '{')
    // await writeFile(join(tmpDir, 'tsconfig.json'), DEFAULT_TSCONFIG)
    await TsServerRequests.updateOpen({
      openFiles: [
        {
          file: join(tmpDir, 'index.js'),
        },
      ],
    })
    expect(
      await TsServerRequests.braceCompletion({
        file: join(tmpDir, 'index.js'),
        line: 1,
        offset: 2,
        openingBrace: '{',
      })
    ).toBe(true)
  },
  /* this can take some time */ TS_SERVER_TEST_TIMEOUT
)

test(
  'completionInfo',
  async () => {
    const tmpDir = await getTmpDir()
    await writeFile(join(tmpDir, 'index.ts'), '{')
    await writeFile(join(tmpDir, 'tsconfig.json'), DEFAULT_TSCONFIG)
    await TsServerRequests.updateOpen({
      openFiles: [
        {
          file: join(tmpDir, 'index.ts'),
        },
      ],
    })
    expect(
      await TsServerRequests.completionInfo({
        file: join(tmpDir, 'index.ts'),
        line: 1,
        offset: 2,
      })
    ).toEqual({
      entries: expect.arrayContaining([
        {
          kind: 'keyword',
          kindModifiers: '',
          name: 'const',
          sortText: '15',
        },
      ]),
      flags: 0,
      isGlobalCompletion: true,
      isMemberCompletion: false,
      isNewIdentifierLocation: false,
    })
  },
  /* this can take some time */ TS_SERVER_TEST_TIMEOUT
)

test(
  'completionInfo - property',
  async () => {
    const tmpDir = await getTmpDir()
    await writeFile(join(tmpDir, 'index.ts'), 'window.add')
    await writeFile(join(tmpDir, 'tsconfig.json'), DEFAULT_TSCONFIG)
    await TsServerRequests.updateOpen({
      openFiles: [
        {
          file: join(tmpDir, 'index.ts'),
        },
      ],
    })
    expect(
      await TsServerRequests.completionInfo({
        file: join(tmpDir, 'index.ts'),
        line: 1,
        offset: 11,
        prefix: 'add',
      })
    ).toEqual({
      entries: expect.arrayContaining([
        {
          kind: 'method',
          kindModifiers: 'declare',
          name: 'addEventListener',
          sortText: '11',
        },
      ]),
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
  },
  /* this can take some time */ TS_SERVER_TEST_TIMEOUT
)

test(
  'completionDetails - property',
  async () => {
    const tmpDir = await getTmpDir()
    await writeFile(join(tmpDir, 'index.ts'), 'window.add')
    await writeFile(join(tmpDir, 'tsconfig.json'), DEFAULT_TSCONFIG)
    await TsServerRequests.updateOpen({
      openFiles: [
        {
          file: join(tmpDir, 'index.ts'),
        },
      ],
    })
    expect(
      await TsServerRequests.completionDetails({
        file: join(tmpDir, 'index.ts'),
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
  },
  /* this can take some time */ TS_SERVER_TEST_TIMEOUT
)

test(
  'jsxClosingTag - when typing slash',
  async () => {
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
  },
  /* this can take some time */ TS_SERVER_TEST_TIMEOUT
)

test(
  'rename - can rename',
  async () => {
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
  },
  /* this can take some time */ TS_SERVER_TEST_TIMEOUT
)

test(
  'rename - cannot rename',
  async () => {
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
  },
  /* this can take some time */ TS_SERVER_TEST_TIMEOUT
)
