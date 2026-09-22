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

interface Dependencies {
  readonly getActiveTextDocument: () => Promise<TextDocument | undefined>
  readonly getPerformanceTrace: (textDocument: TextDocument) => Promise<PerformanceTrace>
  readonly openTrace: (trace: PerformanceTrace) => Promise<void>
}

interface OutputDependencies {
  readonly closeUri: typeof closeUri
  readonly openUri: typeof openUri
  readonly writeFile: typeof writeFile
}

const traceUri = 'memfs://typescript-performance-trace.json'

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
  trace: PerformanceTrace,
  dependencies: OutputDependencies,
): Promise<void> => {
  await dependencies.closeUri(traceUri)
  await dependencies.writeFile(traceUri, JSON.stringify(trace, null, 2))
  await dependencies.openUri(traceUri)
}

const openTrace = (trace: PerformanceTrace): Promise<void> => {
  return openPerformanceTraceWithDependencies(trace, {
    closeUri,
    openUri,
    writeFile,
  })
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
    await dependencies.openTrace(trace)
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
    await dependencies.openTrace(trace)
    return trace
  }
  try {
    const trace = await dependencies.getPerformanceTrace(actualTextDocument)
    const result = {
      ...trace,
      commandDurationMs: performance.now() - start,
    }
    await dependencies.openTrace(result)
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
    await dependencies.openTrace(trace)
    return trace
  }
}

export const showPerformanceTrace = (textDocument?: TextDocument): Promise<PerformanceTrace> => {
  return showPerformanceTraceWithDependencies(textDocument, defaultDependencies)
}
