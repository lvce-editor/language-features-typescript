import { afterEach, expect, jest, test } from '@jest/globals'

const getLibFileUrl = jest.fn((uri: string) => (uri.endsWith('.d.ts') ? `https://example.test/${uri.split('/').at(-1)}` : ''))
const getTextSync = jest.fn((_uri: string) => 'fallback text')
const close = jest.fn()
const read = jest.fn((_cache: unknown, _uri: string) => 'cached text' as string | undefined)
const initializeCache = jest.fn(async () => ({ close, read }))

jest.unstable_mockModule('../src/parts/GetLibFileUrl/GetLibFileUrl.ts', () => ({ getLibFileUrl }))
jest.unstable_mockModule('../src/parts/GetTextSync/GetTextSync.ts', () => ({ getTextSync }))
jest.unstable_mockModule('../src/parts/TypeScriptLibCache/TypeScriptLibCache.ts', () => ({
  getManifest: jest.fn(() => ({ files: [], hash: 'test', totalByteLength: 0 })),
  initialize: initializeCache,
  read,
}))

const { initialize, readLibFile } = await import('../src/parts/ReadLibFile/ReadLibFile.ts')

afterEach(() => {
  jest.clearAllMocks()
  initializeCache.mockResolvedValue({ close, read })
  read.mockReturnValue('cached text')
})

test('starts the optional cache only once on first library access and falls back while it opens', async () => {
  const cacheReady = Promise.withResolvers<{ close: typeof close; read: typeof read }>()
  initializeCache.mockReturnValueOnce(cacheReady.promise)

  expect(readLibFile('source.ts')).toBeUndefined()
  expect(initializeCache).not.toHaveBeenCalled()
  expect(readLibFile('lib.es5.d.ts')).toBe('fallback text')
  expect(readLibFile('lib.esnext.d.ts')).toBe('fallback text')
  expect(initializeCache).toHaveBeenCalledTimes(1)

  cacheReady.resolve({ close, read })
  await cacheReady.promise
  expect(readLibFile('lib.es5.d.ts')).toBe('cached text')
})

test('reads library text from the warm cache and ignores paths outside the library', async () => {
  await initialize()

  expect(readLibFile('lib.es5.d.ts')).toBe('cached text')
  expect(readLibFile('source.ts')).toBeUndefined()
  expect(getTextSync).not.toHaveBeenCalled()
})

test('falls back to synchronous loading after a cache miss or cache read error', async () => {
  await initialize()
  close.mockClear()
  read.mockReturnValueOnce(undefined).mockImplementationOnce(() => {
    throw new Error('cache handle was evicted')
  })

  expect(readLibFile('lib.es5.d.ts')).toBe('fallback text')
  expect(readLibFile('lib.es5.d.ts')).toBe('fallback text')
  expect(close).toHaveBeenCalledTimes(1)
  expect(getTextSync).toHaveBeenCalledTimes(2)
})

test('continues without the cache when initialization fails', async () => {
  initializeCache.mockRejectedValueOnce(new Error('storage unavailable'))

  await expect(initialize()).resolves.toBeUndefined()
  expect(readLibFile('lib.es5.d.ts')).toBe('fallback text')
})

test('uses synchronous loading while the cache opens and switches to the cache when ready', async () => {
  const cacheReady = Promise.withResolvers<{ close: typeof close; read: typeof read }>()
  initializeCache.mockReturnValueOnce(cacheReady.promise)
  const initializing = initialize()

  expect(readLibFile('lib.es5.d.ts')).toBe('fallback text')
  expect(read).not.toHaveBeenCalled()

  cacheReady.resolve({ close, read })
  await initializing

  expect(readLibFile('lib.es5.d.ts')).toBe('cached text')
  expect(getTextSync).toHaveBeenCalledTimes(1)
})
