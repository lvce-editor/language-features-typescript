import { expect, jest, test } from '@jest/globals'
import * as ShowPerformanceTrace from '../src/parts/ShowPerformanceTrace/ShowPerformanceTrace.ts'

const document = {
  text: 'const value = missing',
  uri: 'file:///workspace/test.ts',
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

  const uri = 'memfs://typescript-performance-trace.json'
  expect(closeUri).toHaveBeenCalledWith(uri)
  expect(writeFile).toHaveBeenCalledWith(uri, JSON.stringify(trace, null, 2))
  expect(openUri).toHaveBeenCalledWith(uri)
})
