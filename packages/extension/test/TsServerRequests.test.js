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
