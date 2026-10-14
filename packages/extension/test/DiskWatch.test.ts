import type { FileSystemWatchEvent } from '@lvce-editor/api'
import { afterEach, beforeEach, expect, jest, test } from '@jest/globals'

const state = { result: undefined as any, workspaceUri: 'file:///project/workspace' }
const handlers: ((event: FileSystemWatchEvent) => void)[] = []
const dispose = jest.fn(async () => {})
const create = jest.fn(async (_options: unknown, handler: (event: FileSystemWatchEvent) => void) => {
  handlers.push(handler)
  return { dispose }
})
jest.unstable_mockModule('@lvce-editor/api', () => ({
  createFileSystemWatcher: create,
  getWorkspaceUri: async () => state.workspaceUri,
}))
jest.unstable_mockModule('../src/parts/WriteResult/WriteResult.ts', () => ({
  writeResult: async (_id: number, generate: () => unknown) => {
    state.result = await generate()
  },
}))
const Watch = await import('../src/parts/DiskWatch/DiskWatch.ts')
const { getDiskWatchRoots } = await import('../src/parts/GetDiskWatchRoots/GetDiskWatchRoots.ts')

beforeEach(() => {
  state.workspaceUri = 'file:///project/workspace'
  handlers.length = 0
  create.mockClear()
  dispose.mockClear()
})
afterEach(async () => {
  await Watch.stopAll()
})

test('root planning uses recursive dependencies and shallow config parents on Unix and Windows', () => {
  const unix = getDiskWatchRoots('file:///project/workspace')
  expect(unix.roots).toEqual(['file:///project/workspace/', 'file:///project/node_modules/', 'file:///node_modules/'])
  expect(unix.parents).toEqual(['file:///project/', 'file:///'])
  expect(unix.files).toContain('file:///tsconfig.json')
  const windows = getDiskWatchRoots('file:///C:/project/workspace')
  expect(windows.parents).toEqual(['file:///C:/project/', 'file:///C:/'])
  expect(windows.files).toContain('file:///C:/tsconfig.json')
  const unc = getDiskWatchRoots('file://server/share/project')
  expect(unc.roots).toEqual(['file://server/share/project/', 'file://server/share/node_modules/'])
  expect(unc.parents).toEqual(['file://server/share/'])
  expect(unc.files).toContain('file://server/share/tsconfig.json')
})

test('disk watches include dependencies and filter unrelated shallow-parent events', async () => {
  const descriptor = await Watch.startWatching()
  expect(descriptor?.active).toBe(true)
  expect(create.mock.calls[1][0]).toMatchObject({
    childNames: ['tsconfig.json', 'jsconfig.json', 'package.json'],
    recursive: false,
  })
  handlers[1]({ eventName: 'add', uri: 'file:///project/unrelated.txt' })
  await Watch.getWatchState(1, descriptor.id)
  expect(state.result).toEqual({
    active: true,
    eventCount: 1,
    lastEvent: { eventName: 'add', uri: 'file:///project/unrelated.txt' },
    revision: 0,
  })
  handlers[1]({ eventName: 'add', uri: 'file:///project/tsconfig.json' })
  handlers[0]({ eventName: 'change', uri: 'file:///project/node_modules/example/index.d.ts' })
  await Watch.getWatchState(1, descriptor.id)
  expect(state.result).toEqual({
    active: true,
    eventCount: 3,
    lastEvent: { eventName: 'change', uri: 'file:///project/node_modules/example/index.d.ts' },
    revision: 2,
  })
  await Watch.stopWatching(descriptor.id)
  expect(dispose).toHaveBeenCalledTimes(2)
})

test('runtime watcher failures invalidate trust and workspace switches close watches', async () => {
  const descriptor = await Watch.startWatching()
  handlers[0]({ error: { message: 'ENOSPC', name: 'Error' }, eventName: 'error', uri: '' })
  await Watch.getWatchState(1, descriptor.id)
  expect(state.result.active).toBe(false)
  state.workspaceUri = 'file:///different'
  await Watch.getWatchState(1, descriptor.id)
  expect(state.result.active).toBe(false)
  expect(dispose).toHaveBeenCalledTimes(2)
})

test('registration failure closes earlier watches and leaves validation enabled', async () => {
  create.mockRejectedValueOnce(new Error('unavailable'))
  const descriptor = await Watch.startWatching()
  expect(descriptor?.active).toBe(false)
  await Watch.stopAll()
  state.workspaceUri = 'memfs:///project'
  expect(await Watch.startWatching()).toBeNull()
})

test('stopping during pending setup closes registrations acquired afterward', async () => {
  const { promise, resolve } = Promise.withResolvers<{ dispose: typeof dispose }>()
  create.mockImplementationOnce(async (_options, handler) => {
    handlers.push(handler)
    return promise
  })
  const starting = Watch.startWatching()
  // Drain only the getWorkspaceUri microtask to expose the pending registration.
  await Promise.resolve()
  await Watch.stopAll()
  resolve({ dispose })
  const descriptor = await starting
  expect(descriptor?.active).toBe(false)
  expect(dispose).toHaveBeenCalled()
})

test('failed watcher trust is reported without waiting for disconnected-backend cleanup', async () => {
  const descriptor = await Watch.startWatching()
  const { promise, resolve } = Promise.withResolvers<void>()
  dispose.mockImplementationOnce(async () => promise)
  handlers[0]({ eventName: 'error', uri: '' })
  try {
    const result = await Promise.race([
      (async () => {
        await Watch.getWatchState(1, descriptor.id)
        return 'reported'
      })(),
      new Promise<string>((complete) => setTimeout(complete, 0, 'waiting for disposal')),
    ])
    expect(result).toBe('reported')
    expect(state.result.active).toBe(false)
  } finally {
    resolve()
    await Watch.stopAll()
  }
})

test('Windows and UNC metadata events use filesystem casing semantics', async () => {
  state.workspaceUri = 'file:///C:/Project/Workspace'
  const descriptor = await Watch.startWatching()
  handlers[1]({ eventName: 'change', uri: 'file:///c:/PROJECT/TSCONFIG.JSON' })
  handlers[0]({ eventName: 'change', uri: 'file:///c:/PROJECT/WORKSPACE/main.ts' })
  await Watch.getWatchState(1, descriptor.id)
  expect(state.result).toEqual({
    active: true,
    eventCount: 2,
    lastEvent: { eventName: 'change', uri: 'file:///c:/PROJECT/WORKSPACE/main.ts' },
    revision: 2,
  })
})
