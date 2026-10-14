import { expect, jest, test } from '@jest/globals'
import type { SyncHandle } from '../src/parts/FileContentCache/FileContentCache.ts'
import { createFileSystem } from '../src/parts/CreateFileSystem/CreateFileSystem.ts'

const invoke = jest.fn<(method: string, name?: string | number) => Promise<unknown>>()
jest.unstable_mockModule('../src/parts/Rpc/Rpc.ts', () => ({ invoke }))
const { initialize } = await import('../src/parts/CachedFileClient/CachedFileClient.ts')

const handle = () =>
  ({
    close: jest.fn(),
    flush: jest.fn(),
    getSize: () => 0,
    read: () => 0,
    truncate: jest.fn(),
    write: () => 0,
  }) satisfies SyncHandle

test('opens both cache names asynchronously and releases exclusively owned handles once', async () => {
  const general = handle()
  const dependency = handle()
  const metadata = handle()
  invoke.mockImplementation(async (method, name) => {
    if (method === 'FileCache.startWatching') return null
    let selectedHandle = metadata
    if (name === 'files-v1') selectedHandle = general
    else if (name === 'node-modules-v1') selectedHandle = dependency
    return { createSyncAccessHandle: async () => selectedHandle }
  })
  const cached = await initialize({ invokeSync: () => undefined }, createFileSystem())
  expect(invoke).toHaveBeenCalledWith('FileCache.getHandle', 'files-v1')
  expect(invoke).toHaveBeenCalledWith('FileCache.getHandle', 'node-modules-v1')
  expect(invoke).toHaveBeenCalledWith('FileCache.getHandle', 'node-modules-metadata-v1')
  expect(cached.getCacheStatistics?.()).toMatchObject({ dependenciesEnabled: true, generalEnabled: true })
  cached.dispose?.()
  cached.dispose?.()
  expect(general.close).toHaveBeenCalledTimes(1)
  expect(dependency.close).toHaveBeenCalledTimes(1)
})

test('denied handles and concurrent exclusive owners preserve the original source transport', async () => {
  invoke.mockImplementation(async (method, name) => {
    if (method === 'FileCache.startWatching') return null
    if (name === 'files-v1') throw new Error('Storage denied')
    return {
      createSyncAccessHandle: async () => {
        throw new Error('Already locked')
      },
    }
  })
  const client = { invokeSync: () => 'source content' }
  const cached = await initialize(client, createFileSystem())
  expect(cached.getCacheStatistics?.()).toMatchObject({ dependenciesEnabled: false, generalEnabled: false })
  expect(cached.refresh?.()).toBe(false)
  expect(cached.invokeSync('SyncApi.readFileSync', '/file.ts')).toBe('source content')
})

test('waits for watch readiness before trusting disk contents and stops the session on disposal', async () => {
  invoke.mockClear()
  const { promise, resolve } = Promise.withResolvers<unknown>()
  invoke.mockImplementation(async (method) => {
    if (method === 'FileCache.startWatching') return promise
    if (method === 'FileCache.getHandle') throw new Error('Storage denied')
    return undefined
  })
  let ready = false
  const pending = (async () => {
    const client = await initialize({ invokeSync: () => 'contents' }, createFileSystem())
    ready = true
    return client
  })()
  await Promise.resolve()
  expect(ready).toBe(false)
  resolve({ active: true, files: [], id: 42, revision: 0, roots: ['file:///project'] })
  const client = await pending
  client.dispose?.()
  client.dispose?.()
  expect(invoke.mock.calls.filter(([method]) => method === 'FileCache.stopWatching')).toEqual([
    ['FileCache.stopWatching', 42],
  ])
})

test('failed watcher setup keeps conservative disk identity validation', async () => {
  invoke.mockImplementation(async () => {
    throw new Error('Unavailable')
  })
  let content = 'first'
  const client = await initialize(
    {
      invokeSync: (method) =>
        method === 'FileCache.getHashes' ? [content === 'first' ? 'a'.repeat(64) : 'b'.repeat(64)] : content,
    },
    createFileSystem(),
  )
  expect(client.invokeSync('SyncApi.readFileSync', 'file:///project/main.ts')).toBe('first')
  content = 'changed'
  expect(client.refresh?.()).toBe(true)
  expect(client.invokeSync('SyncApi.readFileSync', 'file:///project/main.ts')).toBe('changed')
  client.dispose?.()
})
