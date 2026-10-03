import { closeUri, executeCommand, openUri, writeFile } from '@lvce-editor/api'
import * as Rpc from '../Rpc/Rpc.ts'

interface TextDocument {
  readonly text: string
  readonly uri: string
}

interface PerformanceTrace {
  readonly error?: {
    readonly details: {
      readonly message: string
      readonly name: string
      readonly stack?: string
    }
    readonly stage: string
  }
  readonly file: {
    readonly uri?: string
  }
  readonly fresh: true
  readonly generatedAt: string
  readonly [key: string]: unknown
  readonly schemaVersion: 1
  readonly totalDurationMs: number
}

interface LoadingTrace {
  readonly status: 'loading'
}

type TraceDocument = LoadingTrace | PerformanceTrace

interface Dependencies {
  readonly getActiveTextDocument: () => Promise<TextDocument | undefined>
  readonly getPerformanceTrace: (textDocument: TextDocument) => Promise<PerformanceTrace>
  readonly openTrace: (trace: TraceDocument) => Promise<void>
}

interface OutputDependencies {
  readonly closeUri: typeof closeUri
  readonly openUri: typeof openUri
  readonly writeFile: typeof writeFile
}

const traceUri = 'memfs://typescript-performance-trace.json'

const traceOutputState = {
  currentOutputUri: '',
  latestRequestId: 0,
  outputGeneration: 0,
  outputQueue: Promise.resolve(),
}

const isTextDocument = (value: unknown): value is TextDocument => {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as TextDocument).text === 'string' &&
    typeof (value as TextDocument).uri === 'string'
  )
}

const toErrorDetails = (error: unknown) => {
  if (!(error instanceof Error)) {
    return {
      message: typeof error === 'string' ? error : JSON.stringify(error),
      name: 'Error',
    }
  }
  return {
    message: error.message,
    name: error.name,
    ...(error.stack && { stack: error.stack }),
  }
}

export const openPerformanceTraceWithDependencies = async (
  trace: TraceDocument,
  dependencies: OutputDependencies,
): Promise<void> => {
  const previousOutputUri = traceOutputState.currentOutputUri
  const isLoading = 'status' in trace
  const nextOutputUri = isLoading ? traceUri : `${traceUri}?result=${++traceOutputState.outputGeneration}`
  if (isLoading && previousOutputUri) {
    await dependencies.closeUri(previousOutputUri)
  }
  await dependencies.writeFile(nextOutputUri, JSON.stringify(trace, null, 2))
  await dependencies.openUri(nextOutputUri)
  if (!isLoading && previousOutputUri) {
    await dependencies.closeUri(previousOutputUri)
  }
  traceOutputState.currentOutputUri = nextOutputUri
}

const openTrace = (trace: TraceDocument): Promise<void> => {
  return openPerformanceTraceWithDependencies(trace, {
    closeUri,
    openUri,
    writeFile,
  })
}

const openTraceForRequest = async (
  requestId: number,
  trace: TraceDocument,
  open: (trace: TraceDocument) => Promise<void>,
): Promise<void> => {
  const previousOperation = traceOutputState.outputQueue
  const outputQueueRelease = { release: () => {} }
  const nextOutputQueue: Promise<void> = new Promise((resolve) => {
    outputQueueRelease.release = resolve
  })
  traceOutputState.outputQueue = nextOutputQueue
  try {
    await previousOperation
    if (requestId !== traceOutputState.latestRequestId) {
      return
    }
    await open(trace)
  } finally {
    outputQueueRelease.release()
  }
}

const getActiveTextDocument = async (): Promise<TextDocument | undefined> => {
  const value = await executeCommand('GetActiveEditor.getTextDocument')
  if (value === undefined) {
    return undefined
  }
  if (isTextDocument(value)) {
    return value
  }
  throw new TypeError('Invalid active text document')
}

const defaultDependencies: Dependencies = {
  getActiveTextDocument,
  getPerformanceTrace: (textDocument) => Rpc.invoke('Diagnostic.getPerformanceTrace', textDocument),
  openTrace,
}

export const showPerformanceTraceWithDependencies = async (
  textDocument: TextDocument | undefined,
  dependencies: Dependencies,
): Promise<PerformanceTrace> => {
  const requestId = ++traceOutputState.latestRequestId
  const start = performance.now()
  let actualTextDocument: TextDocument | undefined
  try {
    actualTextDocument = textDocument ?? (await dependencies.getActiveTextDocument())
  } catch (error) {
    const trace = {
      error: {
        details: toErrorDetails(error),
        stage: 'activeDocument',
      },
      file: {},
      fresh: true as const,
      generatedAt: new Date().toISOString(),
      schemaVersion: 1 as const,
      totalDurationMs: performance.now() - start,
    }
    await openTraceForRequest(requestId, trace, dependencies.openTrace)
    return trace
  }
  if (!actualTextDocument) {
    const trace = {
      error: {
        details: {
          message: 'No active text document is available',
          name: 'Error',
        },
        stage: 'activeDocument',
      },
      file: {},
      fresh: true as const,
      generatedAt: new Date().toISOString(),
      schemaVersion: 1 as const,
      totalDurationMs: performance.now() - start,
    }
    await openTraceForRequest(requestId, trace, dependencies.openTrace)
    return trace
  }
  const performanceTracePromise = Promise.try(() => dependencies.getPerformanceTrace(actualTextDocument))
  await openTraceForRequest(requestId, { status: 'loading' }, dependencies.openTrace)
  try {
    const trace = await performanceTracePromise
    const result = {
      ...trace,
      commandDurationMs: performance.now() - start,
    }
    await openTraceForRequest(requestId, result, dependencies.openTrace)
    return result
  } catch (error) {
    const trace = {
      error: {
        details: toErrorDetails(error),
        stage: 'diagnostics',
      },
      file: { uri: actualTextDocument.uri },
      fresh: true as const,
      generatedAt: new Date().toISOString(),
      schemaVersion: 1 as const,
      totalDurationMs: performance.now() - start,
    }
    await openTraceForRequest(requestId, trace, dependencies.openTrace)
    return trace
  }
}

export const showPerformanceTrace = (textDocument?: TextDocument): Promise<PerformanceTrace> => {
  return showPerformanceTraceWithDependencies(textDocument, defaultDependencies)
}
