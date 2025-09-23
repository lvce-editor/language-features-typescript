import { test, expect, jest } from '@jest/globals'
import { createSyncRpcClient } from '../src/parts/CreateSyncRpcClient/CreateSyncRpcClient.ts'

test('createSyncRpcClient should create a sync RPC client with proper configuration', async () => {
  globalThis.rpc = {
    invoke: jest.fn((method: string) => {
      if (method === 'SyncApi.setup') {
        return Promise.resolve()
      }
      throw new Error(`unexpected method ${method}`)
    }),
  }

  // Mock navigator.storage
  const mockFileHandle = {
    createSyncAccessHandle: () => ({
      write: () => {},
      truncate: () => {},
      flush: () => {},
      getSize: () => 0,
    }),
  }

  const mockRoot = {
    getFileHandle: () => Promise.resolve(mockFileHandle),
    kind: 'directory' as const,
    name: 'test-directory',
    getDirectoryHandle: () => Promise.resolve({}),
    removeEntry: () => Promise.resolve(),
    resolve: () => Promise.resolve([]),
    keys: () => [],
    values: () => [],
    entries: () => [],
    isSameEntry: () => Promise.resolve(false),
  } as any

  // @ts-ignore
  globalThis.navigator = {
    storage: {
      getDirectory: () => Promise.resolve(mockRoot),
      estimate: () => Promise.resolve({}),
      persisted: () => Promise.resolve(false),
    },
  }

  const syncRpcClient = await createSyncRpcClient({
    maxDelay: 1000,
    crossOriginIsolated: true,
    syncId: 123,
  })

  expect(syncRpcClient).toBeDefined()
  expect(typeof syncRpcClient.invokeSync).toBe('function')
})

test('createSyncRpcClient should handle crossOriginIsolated false', async () => {
  globalThis.rpc = {
    invoke: jest.fn((method: string) => {
      if (method === 'SyncApi.setup') {
        return Promise.resolve()
      }
      throw new Error(`unexpected method ${method}`)
    }),
  }

  const mockFileHandle = {
    createSyncAccessHandle: () => ({
      write: () => {},
      truncate: () => {},
      flush: () => {},
      getSize: () => 0,
    }),
  }

  const mockRoot = {
    getFileHandle: () => Promise.resolve(mockFileHandle),
    kind: 'directory' as const,
    name: 'test-directory',
    getDirectoryHandle: () => Promise.resolve({}),
    removeEntry: () => Promise.resolve(),
    resolve: () => Promise.resolve([]),
    keys: () => [],
    values: () => [],
    entries: () => [],
    isSameEntry: () => Promise.resolve(false),
  } as any

  // @ts-ignore
  globalThis.navigator = {
    storage: {
      getDirectory: () => Promise.resolve(mockRoot),
      estimate: () => Promise.resolve({}),
      persisted: () => Promise.resolve(false),
    },
  }

  const syncRpcClient = await createSyncRpcClient({
    maxDelay: 1000,
    crossOriginIsolated: false,
    syncId: 123,
  })

  expect(syncRpcClient).toBeDefined()
  expect(typeof syncRpcClient.invokeSync).toBe('function')
})
