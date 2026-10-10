import { expect, jest, test } from '@jest/globals'
import type { SyncHandle } from '../src/parts/FileContentCache/FileContentCache.ts'
import { createFileSystem } from '../src/parts/CreateFileSystem/CreateFileSystem.ts'

const invoke = jest.fn<(method: string, name: string) => Promise<unknown>>()
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
  invoke.mockImplementation(async (_method, name) => ({
    createSyncAccessHandle: async () => (name === 'files-v1' ? general : dependency),
  }))
  const cached = await initialize({ invokeSync: () => undefined }, createFileSystem())
  expect(invoke).toHaveBeenCalledWith('FileCache.getHandle', 'files-v1')
  expect(invoke).toHaveBeenCalledWith('FileCache.getHandle', 'node-modules-v1')
  expect(cached.getCacheStatistics?.()).toMatchObject({ dependenciesEnabled: true, generalEnabled: true })
  cached.dispose?.()
  cached.dispose?.()
  expect(general.close).toHaveBeenCalledTimes(1)
  expect(dependency.close).toHaveBeenCalledTimes(1)
})

test('denied handles and concurrent exclusive owners preserve the original source transport', async () => {
  invoke.mockImplementation(async (_method, name) => {
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
