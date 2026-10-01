import { expect, jest, test } from '@jest/globals'

const cacheReady = Promise.withResolvers<void>()
const initializeCache = jest.fn(() => cacheReady.promise)
const fs = {}
const client = {}
const ts = {}
const set = jest.fn()

jest.unstable_mockModule('../src/parts/CreateFileSystem/CreateFileSystem.ts', () => ({ createFileSystem: () => fs }))
jest.unstable_mockModule('../src/parts/CreateSyncRpcClient/CreateSyncRpcClient.ts', () => ({
  createSyncRpcClient: async () => client,
}))
jest.unstable_mockModule('../src/parts/GetTypeScriptPath/GetTypeScriptPath.ts', () => ({ getTypeScriptPath: () => '' }))
jest.unstable_mockModule('../src/parts/LanguageServices/LanguageServices.ts', () => ({ set }))
jest.unstable_mockModule('../src/parts/LoadTypeScript/LoadTypeScript.ts', () => ({ loadTypeScript: async () => ts }))
jest.unstable_mockModule('../src/parts/ReadLibFile/ReadLibFile.ts', () => ({ initialize: initializeCache }))

const { initialize } = await import('../src/parts/Initialize/Initialize.ts')

test('makes the language service available while the optional library cache is still opening', async () => {
  const initializing = initialize('', true)
  try {
    const result = await Promise.race([
      initializing.then(() => 'ready'),
      new Promise<string>((resolve) => setImmediate(() => resolve('waiting for cache'))),
    ])
    expect(initializeCache).toHaveBeenCalledTimes(1)
    expect(result).toBe('ready')
    expect(set).toHaveBeenCalledWith(1, fs, client, ts)
  } finally {
    cacheReady.resolve()
    await initializing
  }
})
