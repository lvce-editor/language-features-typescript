import { afterEach, expect, jest, test } from '@jest/globals'
const collectIdleProjects = jest.fn()
const getProjectCount = jest.fn(() => 1)
const getStatistics = () => ({ documentOverrides: 0, projects: 0 })
const invoke = jest.fn<(...args: any[]) => Promise<any>>()
const active = jest.fn(() => false)
const revision = jest.fn(() => 1)
jest.unstable_mockModule('../src/parts/GetOrCreateLanguageService/GetOrCreateLanguageService.ts', () => ({
  collectIdleProjects,
  getProjectCount,
  getStatistics,
}))
jest.unstable_mockModule('../src/parts/RequestActivity/RequestActivity.ts', () => ({
  getRevision: revision,
  isActive: active,
}))
jest.unstable_mockModule('../src/parts/Rpc/Rpc.ts', () => ({ invoke }))
const { collect, configure, stop, waitForIdle } = await import('../src/parts/ProjectLifecycle/ProjectLifecycle.ts')
afterEach(() => {
  stop()
  jest.clearAllMocks()
  getProjectCount.mockReturnValue(1)
  jest.useRealTimers()
})

test('does not evict on lifecycle query failure or a stale snapshot after another request', async () => {
  invoke.mockRejectedValueOnce(new Error('unavailable'))
  await collect()
  expect(collectIdleProjects).not.toHaveBeenCalled()
  invoke.mockResolvedValueOnce(undefined)
  await collect()
  expect(collectIdleProjects).not.toHaveBeenCalled()
  const pending = Promise.withResolvers<readonly string[]>()
  invoke.mockReturnValueOnce(pending.promise)
  const collecting = collect()
  revision.mockReturnValueOnce(2)
  pending.resolve([])
  await collecting
  expect(collectIdleProjects).not.toHaveBeenCalled()
})

test('ignores snapshots from a previous initialization and suppresses overlapping collections', async () => {
  const pending = Promise.withResolvers<readonly string[]>()
  invoke.mockReturnValueOnce(pending.promise)
  const collecting = collect()
  await collect()
  expect(invoke).toHaveBeenCalledTimes(1)
  stop()
  pending.resolve([])
  await collecting
  expect(collectIdleProjects).not.toHaveBeenCalled()
})

test('collects with configured idle age and warm bound, while active requests suppress polling', async () => {
  expect(() => configure(-1)).toThrow('Invalid')
  expect(() => configure(0, 0.5)).toThrow('Invalid')
  configure(500, 2)
  invoke.mockResolvedValueOnce(['file:///a.ts'])
  await collect()
  expect(collectIdleProjects).toHaveBeenCalledWith(['file:///a.ts'], 500, 2)
  active.mockReturnValueOnce(true)
  await collect()
  expect(invoke).toHaveBeenCalledTimes(1)
})

test('scheduled cleanup stops after reinitialization, including a pending snapshot', async () => {
  jest.useFakeTimers()
  const pending = Promise.withResolvers<readonly string[]>()
  invoke.mockReturnValueOnce(pending.promise)
  configure(1000)
  const tick = jest.advanceTimersByTimeAsync(1000)
  await Promise.resolve()
  stop()
  pending.resolve([])
  await tick
  expect(jest.getTimerCount()).toBe(0)
})

test('scheduled cleanup repeats, waits for observable retirement, and has a bounded timeout', async () => {
  jest.useFakeTimers()
  invoke.mockResolvedValue([])
  configure(1000)
  const waiting = waitForIdle(2000)
  await jest.advanceTimersByTimeAsync(1000)
  expect(collectIdleProjects).toHaveBeenCalled()
  getProjectCount.mockReturnValue(0)
  await jest.advanceTimersByTimeAsync(100)
  await expect(waiting).resolves.toEqual(getStatistics())
  await collect()
  getProjectCount.mockReturnValue(1)
  await expect(waitForIdle(0)).rejects.toThrow('did not become idle')
  stop()
})

test('invalid snapshots and requests still active after the query preserve caches', async () => {
  invoke.mockResolvedValueOnce([1])
  await collect()
  expect(collectIdleProjects).not.toHaveBeenCalled()
  invoke.mockImplementationOnce(async () => {
    active.mockReturnValueOnce(true)
    return []
  })
  await collect()
  expect(collectIdleProjects).not.toHaveBeenCalled()
})
