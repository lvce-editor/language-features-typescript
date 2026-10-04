import { afterEach, expect, jest, test } from '@jest/globals'

const cacheReady = Promise.withResolvers<void>()
const initializeCache = jest.fn(() => cacheReady.promise)
const fs = {}
const client = {}
const ts = {}
const set = jest.fn()
const dispose = jest.fn()
const resetLanguageServices = jest.fn()
const initializeFiles = jest.fn(async (_client: unknown, _fs: unknown) => client)
const loadTypeScript = jest.fn(async () => ts)

jest.unstable_mockModule('../src/parts/CreateFileSystem/CreateFileSystem.ts', () => ({ createFileSystem: () => fs }))
jest.unstable_mockModule('../src/parts/CreateSyncRpcClient/CreateSyncRpcClient.ts', () => ({
  createSyncRpcClient: async () => client,
}))
jest.unstable_mockModule('../src/parts/GetTypeScriptPath/GetTypeScriptPath.ts', () => ({ getTypeScriptPath: () => '' }))
jest.unstable_mockModule('../src/parts/LanguageServices/LanguageServices.ts', () => ({
  get: () => ({ client: { dispose } }),
  set,
}))
jest.unstable_mockModule('../src/parts/GetOrCreateLanguageService/GetOrCreateLanguageService.ts', () => ({
  resetLanguageServices,
}))
jest.unstable_mockModule('../src/parts/CachedFileClient/CachedFileClient.ts', () => ({ initialize: initializeFiles }))
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
      (async () => {
        await initializing
        return 'ready'
      })(),
      new Promise<string>((resolve) => setTimeout(resolve, 0, 'waiting for cache')),
    ])
    expect(initializeCache).toHaveBeenCalledTimes(1)
    expect(result).toBe('ready')
    expect(set).toHaveBeenCalledWith(1, fs, client, ts)
  } finally {
    cacheReady.resolve()
    await initializing
  }
})

test('warms the library cache while the TypeScript module is still loading', async () => {
  const typeScriptReady = Promise.withResolvers<typeof ts>()
  loadTypeScript.mockReturnValueOnce(typeScriptReady.promise)
  const initializing = initialize('', true)
  try {
    expect(loadTypeScript).toHaveBeenCalledTimes(1)
    expect(initializeCache).toHaveBeenCalledTimes(1)
    expect(set).not.toHaveBeenCalled()
  } finally {
    typeScriptReady.resolve(ts)
    await initializing
  }
})

test('opens source caches before the TypeScript module finishes loading', async () => {
  const typeScriptReady = Promise.withResolvers<typeof ts>()
  loadTypeScript.mockReturnValueOnce(typeScriptReady.promise)
  const initializing = initialize('', true)
  try {
    // Allow the synchronous transport setup to finish while module loading is pending.
    await Promise.resolve()
    expect(initializeFiles).toHaveBeenCalledWith(client, fs)
    expect(set).not.toHaveBeenCalled()
  } finally {
    typeScriptReady.resolve(ts)
    await initializing
  }
})

test('disposes old programs and cache handles before acquiring replacement handles', async () => {
  await initialize('', true)
  expect(resetLanguageServices).toHaveBeenCalledTimes(1)
  expect(dispose).toHaveBeenCalledTimes(1)
  expect(initializeFiles).toHaveBeenCalledWith(client, fs)
  expect(dispose.mock.invocationCallOrder[0]).toBeLessThan(initializeFiles.mock.invocationCallOrder[0])
})
