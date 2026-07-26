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
      flush: () => {},
      getSize: () => 0,
      truncate: () => {},
      write: () => {},
    }),
  }

  const mockRoot = {
    entries: () => [],
    getDirectoryHandle: () => Promise.resolve({}),
    getFileHandle: () => Promise.resolve(mockFileHandle),
    isSameEntry: () => Promise.resolve(false),
    keys: () => [],
    kind: 'directory' as const,
    name: 'test-directory',
    removeEntry: () => Promise.resolve(),
    resolve: () => Promise.resolve([]),
    values: () => [],
  } as any

  // @ts-ignore
  globalThis.navigator = {
    storage: {
      estimate: () => Promise.resolve({}),
      getDirectory: () => Promise.resolve(mockRoot),
      persisted: () => Promise.resolve(false),
    },
  }

  const syncRpcClient = await createSyncRpcClient({
    crossOriginIsolated: true,
    maxDelay: 1000,
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
      flush: () => {},
      getSize: () => 0,
      truncate: () => {},
      write: () => {},
    }),
  }

  const mockRoot = {
    entries: () => [],
    getDirectoryHandle: () => Promise.resolve({}),
    getFileHandle: () => Promise.resolve(mockFileHandle),
    isSameEntry: () => Promise.resolve(false),
    keys: () => [],
    kind: 'directory' as const,
    name: 'test-directory',
    removeEntry: () => Promise.resolve(),
    resolve: () => Promise.resolve([]),
    values: () => [],
  } as any

  // @ts-ignore
  globalThis.navigator = {
    storage: {
      estimate: () => Promise.resolve({}),
      getDirectory: () => Promise.resolve(mockRoot),
      persisted: () => Promise.resolve(false),
    },
  }

  const syncRpcClient = await createSyncRpcClient({
    crossOriginIsolated: false,
    maxDelay: 1000,
    syncId: 123,
  })

  expect(syncRpcClient).toBeDefined()
  expect(typeof syncRpcClient.invokeSync).toBe('function')
})
