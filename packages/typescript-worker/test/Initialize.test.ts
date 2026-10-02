import { afterEach, expect, jest, test } from '@jest/globals'

const cacheReady = Promise.withResolvers<void>()
const initializeCache = jest.fn(() => cacheReady.promise)
const fs = {}
const client = {}
const ts = {}
const set = jest.fn()
const loadTypeScript = jest.fn(async () => ts)

jest.unstable_mockModule('../src/parts/CreateFileSystem/CreateFileSystem.ts', () => ({ createFileSystem: () => fs }))
jest.unstable_mockModule('../src/parts/CreateSyncRpcClient/CreateSyncRpcClient.ts', () => ({
  createSyncRpcClient: async () => client,
}))
jest.unstable_mockModule('../src/parts/GetTypeScriptPath/GetTypeScriptPath.ts', () => ({ getTypeScriptPath: () => '' }))
jest.unstable_mockModule('../src/parts/LanguageServices/LanguageServices.ts', () => ({ set }))
jest.unstable_mockModule('../src/parts/LoadTypeScript/LoadTypeScript.ts', () => ({ loadTypeScript }))
jest.unstable_mockModule('../src/parts/ReadLibFile/ReadLibFile.ts', () => ({ initialize: initializeCache }))

const { initialize } = await import('../src/parts/Initialize/Initialize.ts')

afterEach(() => {
  jest.clearAllMocks()
})

test('makes the language service available while the optional library cache is still opening', async () => {
  const initializing = initialize('', true)
  try {
    const result = await Promise.race([
      initializing.then(() => 'ready'),
      new Promise<string>((resolve) => setTimeout(() => resolve('waiting for cache'), 0)),
    ])
    expect(initializeCache).not.toHaveBeenCalled()
    expect(result).toBe('ready')
    expect(set).toHaveBeenCalledWith(1, fs, client, ts)
  } finally {
    cacheReady.resolve()
    await initializing
  }
})

test('does not compete with TypeScript loading by warming the library cache', async () => {
  const typeScriptReady = Promise.withResolvers<typeof ts>()
  loadTypeScript.mockReturnValueOnce(typeScriptReady.promise)
  const initializing = initialize('', true)
  try {
    expect(loadTypeScript).toHaveBeenCalledTimes(1)
    expect(initializeCache).not.toHaveBeenCalled()
    expect(set).not.toHaveBeenCalled()
  } finally {
    typeScriptReady.resolve(ts)
    await initializing
  }
})
