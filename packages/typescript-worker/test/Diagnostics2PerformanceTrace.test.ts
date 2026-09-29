import { expect, jest, test } from '@jest/globals'

const getOrCreateLanguageService = jest.fn((_uri: string, _trace: unknown) => ({
  fs: {
    writeFile: jest.fn(),
  },
  languageService: {
    getSemanticDiagnostics: jest.fn(() => []),
  },
}))

jest.unstable_mockModule('../src/parts/GetOrCreateLanguageService/GetOrCreateLanguageService.ts', () => ({
  getOrCreateLanguageService,
}))

jest.unstable_mockModule('../src/parts/GetDiagnosticFromTsResult2/GetDiagnosticFromTsResult2.ts', () => ({
  getDiagnosticsFromTsResult2: jest.fn(() => [
    {
      code: 2304,
      message: "Cannot find name 'missing'.",
      source: 'ts',
      type: 'error',
      uri: 'file:///workspace/test.ts',
    },
  ]),
}))

const Diagnostics2 = await import('../src/parts/Diagnostics2/Diagnostics2.ts')
const PerformanceTrace = await import('../src/parts/PerformanceTrace/PerformanceTrace.ts')

test('records diagnostic stages and result count', async () => {
  const trace = PerformanceTrace.createPerformanceTrace('file:///workspace/test.ts')
  const document = {
    text: 'const value = missing',
    uri: 'file:///workspace/test.ts',
  }

  const diagnostics = await Diagnostics2.getDiagnostics2(document, trace)

  expect(diagnostics).toHaveLength(1)
  expect(trace.diagnostics).toEqual({ count: 1 })
  expect(trace.stages).toEqual(
    expect.objectContaining({
      conversion: expect.any(Object),
      documentUpdate: expect.any(Object),
      languageService: expect.any(Object),
      semanticDiagnostics: expect.any(Object),
    }),
  )
  expect(getOrCreateLanguageService).toHaveBeenCalledWith(document.uri, trace)
})

test('measures work without a trace and records repeated synchronous RPC calls', () => {
  const callback = jest.fn(() => 'result')
  expect(PerformanceTrace.measure(undefined, 'ignored', callback)).toBe('result')
  expect(callback).toHaveBeenCalledTimes(1)

  const trace = PerformanceTrace.createPerformanceTrace('/workspace/main.ts')
  PerformanceTrace.recordSyncRpc(trace, 'SyncApi.exists', 2)
  PerformanceTrace.recordSyncRpc(trace, 'SyncApi.exists', 3)
  expect(trace.syncRpc).toEqual({
    callCount: 2,
    durationMs: 5,
    methods: {
      'SyncApi.exists': {
        callCount: 2,
        durationMs: 5,
      },
    },
  })
})

test('normalizes non-error values and errors without stacks for trace output', () => {
  expect(PerformanceTrace.toErrorDetails('failure')).toEqual({
    message: 'failure',
    name: 'Error',
  })
  const error = new Error('failure')
  error.stack = undefined
  expect(PerformanceTrace.toErrorDetails(error)).toEqual({
    message: 'failure',
    name: 'Error',
  })
})
