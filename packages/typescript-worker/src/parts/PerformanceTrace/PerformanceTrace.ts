export interface PerformanceTraceStage {
  readonly durationMs: number
}

export interface PerformanceTraceRpcMethod {
  callCount: number
  durationMs: number
}

export interface PerformanceTrace {
  readonly diagnostics:
    | {
        readonly count: number
      }
    | undefined
  readonly error?: {
    readonly details: {
      readonly message: string
      readonly name: string
      readonly stack?: string
    }
    readonly stage: 'languageService' | 'documentUpdate' | 'semanticDiagnostics' | 'conversion'
  }
  readonly file: {
    readonly uri: string
  }
  readonly fresh: true
  readonly generatedAt: string
  readonly languageService: {
    readonly cache: 'created' | 'reused'
    readonly configPath?: string
    readonly fileCount?: number
  }
  readonly schemaVersion: 1
  readonly stages: Record<string, PerformanceTraceStage>
  readonly syncRpc: {
    readonly callCount: number
    readonly durationMs: number
    readonly methods: Record<string, PerformanceTraceRpcMethod>
  }
  readonly totalDurationMs: number
}

export interface MutablePerformanceTrace {
  diagnostics:
    | {
        count: number
      }
    | undefined
  error: PerformanceTrace['error']
  readonly file: {
    readonly uri: string
  }
  readonly fresh: true
  readonly generatedAt: string
  readonly languageService: {
    cache: 'created' | 'reused'
    configPath?: string
    fileCount?: number
  }
  readonly schemaVersion: 1
  readonly stages: Record<string, PerformanceTraceStage>
  readonly syncRpc: {
    callCount: number
    durationMs: number
    methods: Record<string, PerformanceTraceRpcMethod>
  }
  totalDurationMs: number
}

export const createPerformanceTrace = (uri: string): MutablePerformanceTrace => ({
  diagnostics: undefined,
  error: undefined,
  file: { uri },
  fresh: true,
  generatedAt: new Date().toISOString(),
  languageService: {
    cache: 'created',
  },
  schemaVersion: 1,
  stages: Object.create(null),
  syncRpc: {
    callCount: 0,
    durationMs: 0,
    methods: Object.create(null),
  },
  totalDurationMs: 0,
})

export const measure = <T>(trace: MutablePerformanceTrace | undefined, name: string, callback: () => T): T => {
  if (!trace) {
    return callback()
  }
  const start = performance.now()
  try {
    return callback()
  } finally {
    trace.stages[name] = {
      durationMs: performance.now() - start,
    }
  }
}

export const recordSyncRpc = (trace: MutablePerformanceTrace, method: string, durationMs: number): void => {
  trace.syncRpc.callCount++
  trace.syncRpc.durationMs += durationMs
  const methodTrace = trace.syncRpc.methods[method] || {
    callCount: 0,
    durationMs: 0,
  }
  methodTrace.callCount++
  methodTrace.durationMs += durationMs
  trace.syncRpc.methods[method] = methodTrace
}

export const toErrorDetails = (error: unknown): NonNullable<PerformanceTrace['error']>['details'] => {
  if (!(error instanceof Error)) {
    return {
      message: String(error),
      name: 'Error',
    }
  }
  return {
    message: error.message,
    name: error.name,
    ...(error.stack && { stack: error.stack }),
  }
}
