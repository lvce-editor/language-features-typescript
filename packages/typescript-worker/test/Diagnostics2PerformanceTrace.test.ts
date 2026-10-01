import { expect, jest, test } from '@jest/globals'

const getOrCreateLanguageService = jest.fn((_uri: string, _trace: unknown) => ({
  fs: {
    writeFile: jest.fn(),
  },
  languageService: {
    getProgram: jest.fn(() => ({
      getSourceFiles: () => [
        { fileName: '/workspace/main.ts', text: 'const value = "😀"' },
        { fileName: '/typescript/lib.d.ts', text: 'interface X {}' },
        { fileName: '/workspace/empty.d.ts', text: '' },
      ],
    })),
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
  expect(trace.loadedFiles).toEqual([
    { fileName: '/workspace/main.ts', sizeBytes: 20 },
    { fileName: '/typescript/lib.d.ts', sizeBytes: 14 },
    { fileName: '/workspace/empty.d.ts', sizeBytes: 0 },
  ])
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

test('captures and returns the first ordinary diagnostic trace for its document', async () => {
  const document = {
    text: 'const first = true',
    uri: 'file:///workspace/first-diagnostic-trace.ts',
  }

  await Diagnostics2.getDiagnostics2(document)
  const trace = await Diagnostics2.getFirstPerformanceTrace(document)
  const laterTrace = await Diagnostics2.getFirstPerformanceTrace(document)

  expect(trace).toBe(laterTrace)
  expect(trace.file.uri).toBe(document.uri)
  expect(trace.totalDurationMs).toBeGreaterThanOrEqual(0)
  expect(trace.diagnostics).toEqual({ count: 1 })
  expect(trace.loadedFiles).toHaveLength(3)
  expect(getOrCreateLanguageService).toHaveBeenLastCalledWith(
    document.uri,
    expect.objectContaining({
      fresh: true,
      syncRpc: expect.any(Object),
    }),
  )

  await Diagnostics2.getDiagnostics2(document)

  expect(getOrCreateLanguageService).toHaveBeenLastCalledWith(document.uri, undefined)
})

test('retains a failed first diagnostic trace for inspection', async () => {
  const document = {
    text: 'const first = true',
    uri: 'file:///workspace/failed-first-diagnostic-trace.ts',
  }
  getOrCreateLanguageService.mockImplementationOnce(() => {
    throw new Error('first diagnostic failed')
  })

  await expect(Diagnostics2.getDiagnostics2(document)).rejects.toThrow('first diagnostic failed')

  const trace = await Diagnostics2.getFirstPerformanceTrace(document)
  expect(trace.error).toEqual(
    expect.objectContaining({
      details: expect.objectContaining({ message: 'first diagnostic failed' }),
      stage: 'semanticDiagnostics',
    }),
  )
})

test('limits first-pass trace capture to a bounded number of documents', async () => {
  const documents = Array.from({ length: 9 }, (_, index) => ({
    text: 'const first = true',
    uri: `file:///workspace/first-trace-cap-${index}.ts`,
  }))

  for (const document of documents) await Diagnostics2.getDiagnostics2(document)

  const lastDocumentTraceArgument = getOrCreateLanguageService.mock.calls.findLast(
    ([uri]) => uri === documents.at(-1)!.uri,
  )?.[1]
  expect(lastDocumentTraceArgument).toBeUndefined()
  expect(
    getOrCreateLanguageService.mock.calls.filter(
      ([uri, trace]) => uri.startsWith('file:///workspace/first-trace-cap-') && trace,
    ).length,
  ).toBeGreaterThan(0)
})

test('reports a cached source file snapshot for a reused language service', async () => {
  const trace = PerformanceTrace.createPerformanceTrace('file:///workspace/test.ts')
  trace.languageService.cache = 'reused'
  const getSourceFiles = jest.fn(() => [
    { fileName: '/workspace/main.ts', text: 'const value = "😀"' },
    { fileName: '/typescript/lib.d.ts', text: 'interface X {}' },
  ])
  const languageService = {
    getProgram: jest.fn(() => ({ getSourceFiles })),
    getSemanticDiagnostics: jest.fn(() => []),
  }
  getOrCreateLanguageService.mockReturnValue({ fs: { writeFile: jest.fn() }, languageService })

  await Diagnostics2.getDiagnostics2({ text: 'const value = 1', uri: trace.file.uri }, trace)
  const repeatedTrace = PerformanceTrace.createPerformanceTrace(trace.file.uri)
  repeatedTrace.languageService.cache = 'reused'
  await Diagnostics2.getDiagnostics2({ text: 'const value = 2', uri: trace.file.uri }, repeatedTrace)

  expect(trace.loadedFiles).toEqual([
    { fileName: '/workspace/main.ts', sizeBytes: 20 },
    { fileName: '/typescript/lib.d.ts', sizeBytes: 14 },
  ])
  expect(repeatedTrace.loadedFiles).toEqual(trace.loadedFiles)
  expect(getSourceFiles).toHaveBeenCalledTimes(1)
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
  Object.defineProperty(error, 'stack', { value: undefined })
  expect(PerformanceTrace.toErrorDetails(error)).toEqual({
    message: 'failure',
    name: 'Error',
  })
})
