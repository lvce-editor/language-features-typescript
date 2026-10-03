import { expect, jest, test } from '@jest/globals'
import * as ShowPerformanceTrace from '../src/parts/ShowPerformanceTrace/ShowPerformanceTrace.ts'

const document = {
  text: 'const value = missing',
  uri: 'file:///workspace/test.ts',
}

type TestTrace = {
  file: { uri: string }
  fresh: true
  generatedAt: string
  schemaVersion: 1
  totalDurationMs: number
}

test('reports when no active text document is available', async () => {
  const openTrace = jest.fn(async (_trace: unknown) => {})

  const trace = await ShowPerformanceTrace.showPerformanceTraceWithDependencies(undefined, {
    getActiveTextDocument: async () => undefined,
    getPerformanceTrace: async (_textDocument) => {
      throw new Error('unexpected call')
    },
    openTrace,
  })

  expect(trace.error).toMatchObject({
    details: { message: 'No active text document is available' },
    stage: 'activeDocument',
  })
  expect(openTrace).toHaveBeenCalledWith(trace)
})

test('returns and opens the worker performance trace', async () => {
  const workerTrace = {
    diagnostics: { count: 1 },
    file: { uri: document.uri },
    fresh: true as const,
    generatedAt: '2026-09-22T00:00:00.000Z',
    languageService: { cache: 'created' as const, fileCount: 1 },
    schemaVersion: 1 as const,
    stages: {
      semanticDiagnostics: { durationMs: 12 },
    },
    syncRpc: { callCount: 2, durationMs: 5, methods: {} },
    totalDurationMs: 20,
  }
  const openTrace = jest.fn(async (_trace: unknown) => {})
  const getPerformanceTrace = jest.fn(async (_textDocument: typeof document) => workerTrace)

  const trace = await ShowPerformanceTrace.showPerformanceTraceWithDependencies(document, {
    getActiveTextDocument: async () => undefined,
    getPerformanceTrace: async (textDocument) => getPerformanceTrace(textDocument),
    openTrace,
  })

  expect(getPerformanceTrace).toHaveBeenCalledWith(document)
  expect(trace).toEqual({
    ...workerTrace,
    commandDurationMs: expect.any(Number),
  })
  expect(openTrace).toHaveBeenCalledWith(trace)
})

test('opens a loading trace before replacing it with the completed trace', async () => {
  const { promise: pendingTrace, resolve: resolveTrace } = Promise.withResolvers<TestTrace>()
  const openedTraces: unknown[] = []
  const openTrace = jest.fn(async (trace: unknown) => {
    openedTraces.push(trace)
  })

  const resultPromise = ShowPerformanceTrace.showPerformanceTraceWithDependencies(document, {
    getActiveTextDocument: async () => undefined,
    getPerformanceTrace: async () => pendingTrace,
    openTrace,
  })

  await Promise.resolve()
  expect(openTrace).toHaveBeenCalledWith({ status: 'loading' })
  expect(openedTraces).toEqual([{ status: 'loading' }])

  const workerTrace = {
    file: { uri: document.uri },
    fresh: true as const,
    generatedAt: '2026-09-22T00:00:00.000Z',
    schemaVersion: 1 as const,
    totalDurationMs: 20,
  }
  resolveTrace(workerTrace)

  const result = await resultPromise
  expect(result).toMatchObject(workerTrace)
  expect(openedTraces).toEqual([{ status: 'loading' }, result])
})

test('replaces a loading trace with the structured diagnostic error', async () => {
  const openedTraces: unknown[] = []
  const openTrace = jest.fn(async (trace: unknown) => {
    openedTraces.push(trace)
  })

  const result = await ShowPerformanceTrace.showPerformanceTraceWithDependencies(document, {
    getActiveTextDocument: async () => undefined,
    getPerformanceTrace: async () => {
      throw new Error('diagnostic failed')
    },
    openTrace,
  })

  expect(openedTraces[0]).toEqual({ status: 'loading' })
  expect(result.error).toMatchObject({
    details: { message: 'diagnostic failed' },
    stage: 'diagnostics',
  })
  expect(openedTraces[1]).toBe(result)
})

test('keeps the newest result when trace commands overlap', async () => {
  const { promise: firstTrace, resolve: resolveFirst } = Promise.withResolvers<TestTrace>()
  const { promise: secondTrace, resolve: resolveSecond } = Promise.withResolvers<TestTrace>()
  const openedTraces: unknown[] = []
  const openTrace = jest.fn(async (trace: unknown) => {
    openedTraces.push(trace)
  })
  const createTrace = (generatedAt: string) => ({
    file: { uri: document.uri },
    fresh: true as const,
    generatedAt,
    schemaVersion: 1 as const,
    totalDurationMs: 20,
  })
  const dependencies = {
    getActiveTextDocument: async () => undefined,
    getPerformanceTrace: async (_textDocument: typeof document) => firstTrace,
    openTrace,
  }

  const firstResult = ShowPerformanceTrace.showPerformanceTraceWithDependencies(document, dependencies)
  await Promise.resolve()
  const secondResult = ShowPerformanceTrace.showPerformanceTraceWithDependencies(document, {
    ...dependencies,
    getPerformanceTrace: async () => secondTrace,
  })
  await Promise.resolve()

  const newerTrace = createTrace('2026-09-23T00:00:00.000Z')
  resolveSecond(newerTrace)
  await secondResult
  resolveFirst(createTrace('2026-09-22T00:00:00.000Z'))
  await firstResult

  expect(openedTraces).toEqual([{ status: 'loading' }, { status: 'loading' }, expect.objectContaining(newerTrace)])
})

test('writes a pretty-printed trace to a named document', async () => {
  const closeUri = jest.fn(async (_uri: string) => {})
  const openUri = jest.fn(async (_uri: string) => {})
  const writeFile = jest.fn(async (_uri: string, _content: string) => {})
  const trace = {
    file: { uri: document.uri },
    fresh: true as const,
    generatedAt: '2026-09-22T00:00:00.000Z',
    schemaVersion: 1 as const,
    totalDurationMs: 1.234568,
  }

  await ShowPerformanceTrace.openPerformanceTraceWithDependencies(trace, {
    closeUri,
    openUri,
    writeFile,
  })

  const uri = 'memfs://typescript-performance-trace.json?result=1'
  expect(closeUri).not.toHaveBeenCalled()
  expect(writeFile).toHaveBeenCalledWith(uri, JSON.stringify(trace, null, 2))
  expect(openUri).toHaveBeenCalledWith(uri)
})
