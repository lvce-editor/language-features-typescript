import {
  collectIdleProjects,
  getProjectCount,
  getStatistics,
} from '../GetOrCreateLanguageService/GetOrCreateLanguageService.ts'
import * as RequestActivity from '../RequestActivity/RequestActivity.ts'
import * as Rpc from '../Rpc/Rpc.ts'

const state: {
  collecting: boolean
  generation: number
  idleMs: number
  maxIdleProjects: number
  timer: ReturnType<typeof setTimeout> | undefined
} = { collecting: false, generation: 0, idleMs: 30_000, maxIdleProjects: 0, timer: undefined }

export const collect = async (): Promise<void> => {
  if (state.collecting || RequestActivity.isActive() || !getProjectCount()) return
  state.collecting = true
  const revision = RequestActivity.getRevision()
  const currentGeneration = state.generation
  try {
    const uris = await Rpc.invoke('DocumentLifecycle.getOpenUris')
    if (!Array.isArray(uris) || uris.some((uri) => typeof uri !== 'string')) return
    // A request may have reopened/edited a document while the snapshot returned.
    if (
      state.generation !== currentGeneration ||
      RequestActivity.isActive() ||
      revision !== RequestActivity.getRevision()
    )
      return
    collectIdleProjects(uris, state.idleMs, state.maxIdleProjects)
  } catch {
    // Unsupported/failed lifecycle queries must not authorize eviction.
  } finally {
    state.collecting = false
  }
}

const schedule = (): void => {
  const currentGeneration = state.generation
  state.timer = setTimeout(
    async () => {
      state.timer = undefined
      await collect()
      if (state.generation === currentGeneration && state.timer === undefined) schedule()
    },
    Math.max(1000, Math.min(state.idleMs, 30_000)),
  )
}

export const stop = (): void => {
  state.generation++
  clearTimeout(state.timer)
  state.timer = undefined
}

export const start = (): void => {
  stop()
  schedule()
}

export const configure = (milliseconds: number, warmProjects = 0): void => {
  if (!Number.isFinite(milliseconds) || milliseconds < 0 || !Number.isSafeInteger(warmProjects) || warmProjects < 0) {
    throw new Error('Invalid TypeScript idle cache configuration')
  }
  state.idleMs = milliseconds
  state.maxIdleProjects = warmProjects
  start()
}

export const waitForIdle = async (timeoutMs = 45_000) => {
  const deadline = performance.now() + timeoutMs
  while (getProjectCount()) {
    if (performance.now() >= deadline) throw new Error('TypeScript projects did not become idle')
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  return getStatistics()
}
