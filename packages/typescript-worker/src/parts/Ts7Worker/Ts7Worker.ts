import { instantiateWasm } from 'typescript7/wasm'
import { createSyncRpcClient } from '../CreateSyncRpcClient/CreateSyncRpcClient.ts'
import * as Rpc from '../Rpc/Rpc.ts'
import { createSession, type Document, type Host, version } from '../Ts7Session/Ts7Session.ts'

type Backend = ReturnType<typeof createSession>
const state = {
  client: undefined as Awaited<ReturnType<typeof createSyncRpcClient>> | undefined,
  completions: [] as number[],
  diagnostics: [] as number[],
  firstTraces: new Map<string, unknown>(),
  initializing: undefined as Promise<void> | undefined,
  pending: Promise.resolve() as Promise<unknown>,
  session: undefined as Backend | undefined,
  startupMs: 0,
}

const readAsset = async (name: string) => {
  const response = await fetch(new URL(`../../../.tmp/dist/typescript/${name}`, import.meta.url))
  if (!response.ok) throw new Error(`Unable to load TypeScript ${version} ${name}: HTTP ${response.status}`)
  return response
}

const loadWasm = async () => {
  const response = await readAsset('tsc.wasm')
  return WebAssembly.compile(await response.arrayBuffer())
}

const loadLibraries = async (): Promise<Record<string, string>> => {
  const response = await readAsset('libs.json')
  return response.json()
}

const start = async (crossOriginIsolated: boolean) => {
  const started = performance.now()
  // Wait for every acquisition even on failure, so a later RPC setup cannot
  // leave handles behind after an earlier fetch rejected initialization.
  const [wasm, libraries, rpc] = await Promise.allSettled([
    loadWasm(),
    loadLibraries(),
    createSyncRpcClient({ crossOriginIsolated, maxDelay: 30_000, syncId: 1 }),
  ])
  if (rpc.status === 'fulfilled') state.client = rpc.value
  try {
    if (wasm.status === 'rejected') throw wasm.reason
    if (libraries.status === 'rejected') throw libraries.reason
    if (rpc.status === 'rejected') throw rpc.reason
    const host: Host = {
      readDirectory: (uri) => rpc.value.invokeSync('SyncApi.readDirectoryEntries', uri) ?? undefined,
      readFile: (uri) => rpc.value.invokeSync('SyncApi.readFileOptional', uri) ?? undefined,
    }
    state.session = createSession(await instantiateWasm(wasm.value), libraries.value, host)
    state.startupMs = performance.now() - started
  } catch (error) {
    await state.client?.dispose?.()
    state.client = undefined
    state.initializing = undefined
    throw error
  }
}

export const initialize = (_path: string, crossOriginIsolated: boolean): Promise<void> => {
  state.initializing ??= start(crossOriginIsolated)
  return state.initializing
}

const settle = async (promise: Promise<unknown>) => {
  try {
    await promise
  } catch {
    // A failed request must not poison the queue for subsequent requests.
  }
}

const request = <T>(execute: (backend: Backend, uris: readonly string[]) => T) => {
  const previous = state.pending
  const result = (async () => {
    await previous
    await state.initializing
    if (!state.session) throw new Error('TypeScript 7 worker has not been initialized')
    const uris: readonly string[] = await Rpc.invoke('DocumentLifecycle.getOpenUris')
    return execute(state.session, uris)
  })()
  state.pending = settle(result)
  return result
}

const record = (samples: number[], started: number) => {
  samples.push(performance.now() - started)
  if (samples.length > 16) samples.shift()
}

export const completion = (document: Document, offset: number) =>
  request((backend, uris) => {
    const started = performance.now()
    try {
      return backend.completion(document, offset, uris)
    } finally {
      record(state.completions, started)
    }
  })

const analyze = (backend: Backend, document: Document, uris: readonly string[]) => {
  const started = performance.now()
  const diagnostics = backend.diagnostics(document, uris)
  record(state.diagnostics, started)
  const trace = {
    compilerVersion: version,
    crossOriginIsolated: globalThis.crossOriginIsolated,
    diagnostics: { count: diagnostics.length, items: diagnostics.slice(0, 10) },
    file: { uri: document.uri },
    schemaVersion: 1,
    totalDurationMs: performance.now() - started,
  }
  if (!state.firstTraces.has(document.uri) && state.firstTraces.size < 8) state.firstTraces.set(document.uri, trace)
  return { diagnostics, trace }
}

export const diagnostics = (document: Document) =>
  request((backend, uris) => analyze(backend, document, uris).diagnostics)
export const performanceTrace = (document: Document) =>
  request((backend, uris) => analyze(backend, document, uris).trace)
export const firstPerformanceTrace = async (document: Document) =>
  state.firstTraces.get(document.uri) ?? performanceTrace(document)

const statistics = async () => {
  await state.pending
  return {
    compilerVersion: version,
    completionMs: [...state.completions],
    crossOriginIsolated: globalThis.crossOriginIsolated,
    diagnosticMs: [...state.diagnostics],
    startupMs: state.startupMs,
    ...state.session?.statistics(),
  }
}

export const dispose = async () => {
  if (state.initializing) await settle(state.initializing)
  await state.pending
  state.session?.close()
  await state.client?.dispose?.()
  state.session = undefined
  state.initializing = undefined
  state.client = undefined
  state.firstTraces.clear()
  state.completions.length = 0
  state.diagnostics.length = 0
}

export const commandMap = {
  'Completion.getCompletions': completion,
  'Completion.resolveCompletion': (_document: Document, _offset: number, _name: string, item: unknown) => item,
  'Diagnostic.getDiagnostics': diagnostics,
  'Diagnostic.getFirstPerformanceTrace': firstPerformanceTrace,
  'Diagnostic.getPerformanceTrace': performanceTrace,
  'Initialize.initialize': initialize,
  'ProjectLifecycle.configure': () => {},
  'ProjectLifecycle.getStatistics': statistics,
  'ProjectLifecycle.waitForIdle': statistics,
  'Ts7.dispose': dispose,
}
