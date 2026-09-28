import { expect, jest, test } from '@jest/globals'

const createTypeScriptLanguageService = jest.fn(() => ({
  getProgram: jest.fn(),
}))

jest.unstable_mockModule('../src/parts/CreateTypeScriptLanguageService/CreateTypeScriptLanguageService.ts', () => ({
  createTypeScriptLanguageService,
}))

jest.unstable_mockModule('../src/parts/GetTsconfigPath/GetTsconfigPath.ts', () => ({
  getTsConfigPath: jest.fn(() => '/workspace/tsconfig.json'),
}))

jest.unstable_mockModule('../src/parts/LanguageServices/LanguageServices.ts', () => ({
  get: jest.fn(() => ({
    client: {
      invokeSync: jest.fn(),
    },
    fs: {},
    ts: {},
  })),
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

const { getOrCreateLanguageService } =
  await import('../src/parts/GetOrCreateLanguageService/GetOrCreateLanguageService.ts')

test('reuses a language service for files in the same configured project', () => {
  const first = getOrCreateLanguageService('/workspace/src/main.tsx')
  const second = getOrCreateLanguageService('/workspace/src/App.tsx')

  expect(second.languageService).toBe(first.languageService)
  expect(createTypeScriptLanguageService).toHaveBeenCalledTimes(1)
})

test('records newly created and reused project details in a performance trace', async () => {
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
