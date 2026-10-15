import { expect, jest, test } from '@jest/globals'

const refresh = jest.fn(() => false)
const invokeSync = jest.fn((_method: string, ..._params: readonly unknown[]): unknown => undefined)
const state = { documentRegistry: {} }

const createTypeScriptLanguageService = jest.fn(
  (
    _ts: unknown,
    _fs: unknown,
    _client: unknown,
    _config: unknown,
    _registry: unknown,
    _roots: unknown,
    _references: unknown,
  ) => ({
    dispose: jest.fn(),
    getProgram: jest.fn(),
  }),
)

jest.unstable_mockModule('../src/parts/CreateTypeScriptLanguageService/CreateTypeScriptLanguageService.ts', () => ({
  createTypeScriptLanguageService,
}))

jest.unstable_mockModule('../src/parts/GetTsconfigPath/GetTsconfigPath.ts', () => ({
  getTsConfigPath: jest.fn(() => '/workspace/tsconfig.json'),
}))

jest.unstable_mockModule('../src/parts/LanguageServices/LanguageServices.ts', () => ({
  get: jest.fn(() => ({
    client: {
      invokeSync,
      refresh,
    },
    documentRegistry: state.documentRegistry,
    fs: { getScriptVersion: () => '0', readFile: () => undefined },
    ts: {},
  })),
  resetDocumentRegistry: jest.fn(() => {
    state.documentRegistry = {}
  }),
}))

jest.unstable_mockModule('../src/parts/ParseTsconfig/ParseTsconfig.ts', () => ({
  parseTsconfig: jest.fn(() => ({})),
}))

jest.unstable_mockModule('../src/parts/ResolveTsconfig/ResolveTsconfig.ts', () => ({
  resolveTsconfig: jest.fn(() => ({
    errors: [],
    fileNames: ['/workspace/src/main.tsx', '/workspace/src/App.tsx'],
    options: {},
  })),
}))

const { getOrCreateLanguageService, resetLanguageServices } =
  await import('../src/parts/GetOrCreateLanguageService/GetOrCreateLanguageService.ts')

test('warm JavaScript requests skip repeated config resolution and refresh after disk changes', async () => {
  resetLanguageServices()
  const { resolveTsconfig } = await import('../src/parts/ResolveTsconfig/ResolveTsconfig.ts')
  const resolve = jest.mocked(resolveTsconfig)
  const first = getOrCreateLanguageService('/workspace/main.js')
  const coldCalls = resolve.mock.calls.length
  for (let index = 0; index < 10; index++) {
    expect(getOrCreateLanguageService('/workspace/main.js').languageService).toBe(first.languageService)
  }
  expect(resolve).toHaveBeenCalledTimes(coldCalls)
  refresh.mockReturnValueOnce(true)
  expect(getOrCreateLanguageService('/workspace/main.js').languageService).not.toBe(first.languageService)
  expect(resolve.mock.calls.length).toBeGreaterThan(coldCalls)
  resetLanguageServices()
  createTypeScriptLanguageService.mockClear()
})

test('reuses a language service for files in the same configured project', () => {
  const first = getOrCreateLanguageService('/workspace/src/main.tsx')
  const second = getOrCreateLanguageService('/workspace/src/App.tsx')

  expect(second.languageService).toBe(first.languageService)
  expect(createTypeScriptLanguageService).toHaveBeenCalledTimes(1)
  expect(createTypeScriptLanguageService).toHaveBeenCalledWith(
    {},
    expect.anything(),
    expect.anything(),
    expect.anything(),
    state.documentRegistry,
    expect.any(Set),
    expect.any(Set),
  )
})

test('records newly created and reused project details in a performance trace', async () => {
  resetLanguageServices()
  const PerformanceTrace = await import('../src/parts/PerformanceTrace/PerformanceTrace.ts')
  const trace = PerformanceTrace.createPerformanceTrace('/workspace/trace-main.tsx')
  const first = getOrCreateLanguageService('/workspace/trace-main.tsx', trace)

  expect(trace.languageService).toEqual({
    cache: 'created',
    configPath: '/workspace/tsconfig.json',
    fileCount: 2,
  })
  expect(first.languageService).toBeDefined()

  const reusedTrace = PerformanceTrace.createPerformanceTrace('/workspace/trace-main.tsx')
  const second = getOrCreateLanguageService('/workspace/trace-main.tsx', reusedTrace)
  expect(second.languageService).toBe(first.languageService)
  expect(reusedTrace.languageService.cache).toBe('reused')
})

test.each([new Error('read timed out'), 'read timed out'])(
  'retains the first failed RPC in its trace: %s',
  async (error) => {
    resetLanguageServices()
    const PerformanceTrace = await import('../src/parts/PerformanceTrace/PerformanceTrace.ts')
    const trace = PerformanceTrace.createPerformanceTrace('/workspace/failure-main.tsx')
    getOrCreateLanguageService(trace.file.uri, trace)
    const client = createTypeScriptLanguageService.mock.calls.at(-1)![2] as {
      invokeSync(method: string, ...params: readonly unknown[]): unknown
    }
    invokeSync.mockImplementationOnce(() => {
      throw error
    })
    expect(() => client.invokeSync('SyncApi.readFileSync', '/workspace/missing.ts')).toThrow()
    expect(trace.syncRpc.failure).toEqual({
      message: 'read timed out',
      method: 'SyncApi.readFileSync',
      uri: '/workspace/missing.ts',
    })
    invokeSync.mockImplementationOnce(() => {
      throw new Error('later failure')
    })
    expect(() => client.invokeSync('SyncApi.getWorkspaceUri')).toThrow('later failure')
    expect(trace.syncRpc.failure?.message).toBe('read timed out')
  },
)

test('rebuilds and disposes project state when external file identities change', () => {
  const previousRegistry = state.documentRegistry
  const previous = getOrCreateLanguageService('/workspace/src/main.tsx')
  refresh.mockReturnValueOnce(true)
  const next = getOrCreateLanguageService('/workspace/src/main.tsx')
  expect(next.languageService).not.toBe(previous.languageService)
  expect(previous.languageService.dispose).toHaveBeenCalledTimes(1)
  expect(state.documentRegistry).not.toBe(previousRegistry)
  expect(createTypeScriptLanguageService).toHaveBeenLastCalledWith(
    {},
    expect.anything(),
    expect.anything(),
    expect.anything(),
    state.documentRegistry,
    expect.any(Set),
    expect.any(Set),
  )
  expect(getOrCreateLanguageService('/workspace/src/App.tsx').languageService).toBe(next.languageService)
})

test('unlisted documents share the configured project service instead of creating duplicate programs', () => {
  const first = getOrCreateLanguageService('/workspace/src/main.tsx')
  const newDocument = getOrCreateLanguageService('/workspace/src/new-file.tsx')
  expect(newDocument.languageService).toBe(first.languageService)
})
