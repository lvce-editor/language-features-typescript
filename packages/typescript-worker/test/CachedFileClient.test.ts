import { expect, test } from '@jest/globals'
import type { FileContentCache } from '../src/parts/FileContentCache/FileContentCache.ts'
import { createCachedClient } from '../src/parts/CachedFileClient/CachedFileClient.ts'
import { createFileSystem } from '../src/parts/CreateFileSystem/CreateFileSystem.ts'

const cache = (): FileContentCache => {
  const entries = new Map<string, string>()
  return {
    close: () => entries.clear(),
    get: (key) => entries.get(key),
    set: (key, value) => {
      entries.set(key, value)
    },
  }
}
const firstHash = 'a'.repeat(64)
const secondHash = 'b'.repeat(64)

const fixture = () => {
  const state = {
    content: 'original',
    entries: ['file.ts'],
    failedHash: false,
    hash: firstHash as string | null,
    hashes: 0,
    missing: false,
    reads: 0,
  }
  const client = {
    invokeSync(method: string) {
      switch (method) {
        case 'FileCache.getHashes':
          state.hashes++
          if (state.failedHash) throw new Error('Hash unavailable')
          return [state.hash]
        case 'SyncApi.exists':
          return !state.missing
        case 'SyncApi.readDirSync':
          return state.entries
        case 'SyncApi.readFileSync':
          state.reads++
          if (state.missing) throw new Error('File not found')
          return state.content
        default:
          throw new Error(`Unexpected method ${method}`)
      }
    },
  }
  const fs = createFileSystem()
  return { client, fs, state }
}

test.each(['/project/file.ts', '/project/node_modules/pkg/index.d.ts'])(
  'warm reads validate identity without rereading source: %s',
  (uri) => {
    const { client, fs, state } = fixture()
    const general = cache()
    const dependencies = cache()
    let cached = createCachedClient(client, fs, general, dependencies)
    expect(cached.invokeSync('SyncApi.readFileSync', uri)).toBe('original')
    cached = createCachedClient(client, fs, general, dependencies)
    expect(cached.invokeSync('SyncApi.readFileSync', uri)).toBe('original')
    expect(state.reads).toBe(1)
    expect(state.hashes).toBe(2)
    expect(cached.refresh?.()).toBe(false)
    state.hash = secondHash
    state.content = 'changed'
    expect(cached.refresh?.()).toBe(true)
    expect(cached.invokeSync('SyncApi.readFileSync', uri)).toBe('changed')
    expect(state.reads).toBe(2)
  },
)

test('live unsaved buffers take precedence over cached and disk contents', () => {
  const { client, fs, state } = fixture()
  const cached = createCachedClient(client, fs, cache(), cache())
  cached.invokeSync('SyncApi.readFileSync', '/file.ts')
  fs.writeFile('/file.ts', 'unsaved')
  expect(cached.invokeSync('SyncApi.readFileSync', '/file.ts')).toBe('unsaved')
  expect(cached.refresh?.()).toBe(false)
  expect(state.reads).toBe(1)
  expect(state.hashes).toBe(1)
})

test('deleted files never reuse cached contents and recreation invalidates the program', () => {
  const { client, fs, state } = fixture()
  const cached = createCachedClient(client, fs, cache(), cache())
  cached.invokeSync('SyncApi.readFileSync', '/file.ts')
  state.hash = null
  state.missing = true
  expect(cached.refresh?.()).toBe(true)
  expect(() => cached.invokeSync('SyncApi.readFileSync', '/file.ts')).toThrow('File not found')
  state.hash = secondHash
  state.missing = false
  expect(cached.refresh?.()).toBe(true)
})

test('newly available missing modules and changed directory listings invalidate the program', () => {
  const { client, fs, state } = fixture()
  const cached = createCachedClient(client, fs, cache(), cache())
  state.missing = true
  state.hash = null
  expect(cached.invokeSync('SyncApi.exists', '/file.ts')).toBe(false)
  expect(cached.refresh?.()).toBe(false)
  state.hash = firstHash
  state.missing = false
  expect(cached.refresh?.()).toBe(true)
  cached.invokeSync('SyncApi.readDirSync', '/')
  state.entries = ['file.ts', 'added.ts']
  expect(cached.refresh?.()).toBe(true)
})

test('failed identity requests fall back to source reads and invalidate old programs', () => {
  const { client, fs, state } = fixture()
  const cached = createCachedClient(client, fs, cache(), cache())
  cached.invokeSync('SyncApi.readFileSync', '/file.ts')
  state.failedHash = true
  expect(cached.refresh?.()).toBe(true)
  state.content = 'current'
  expect(cached.invokeSync('SyncApi.readFileSync', '/file.ts')).toBe('current')
  cached.dispose?.()
  expect(cached.refresh?.()).toBe(false)
})

test('unavailable OPFS leaves the original read path intact', () => {
  const { client, fs } = fixture()
  expect(createCachedClient(client, fs, undefined, undefined)).toBe(client)
})

test('readable files with unavailable identities cannot retain stale program snapshots', () => {
  const { client, fs, state } = fixture()
  state.hash = null
  const cached = createCachedClient(client, fs, cache(), cache())
  expect(cached.invokeSync('SyncApi.readFileSync', '/file.ts')).toBe('original')
  state.content = 'changed'
  expect(cached.refresh?.()).toBe(true)
  expect(cached.invokeSync('SyncApi.readFileSync', '/file.ts')).toBe('changed')
})

test('partial cache availability keeps the other category on source reads and disposal is idempotent', () => {
  const { client, fs, state } = fixture()
  const cached = createCachedClient(client, fs, cache(), undefined)
  cached.invokeSync('SyncApi.readFileSync', '/node_modules/pkg/index.ts')
  cached.invokeSync('SyncApi.readFileSync', '/node_modules/pkg/index.ts')
  expect(state.reads).toBe(2)
  expect(cached.getCacheStatistics?.()).toMatchObject({ dependenciesEnabled: false, dependencyHits: 0, sourceReads: 2 })
  cached.dispose?.()
  cached.dispose?.()
  cached.invokeSync('SyncApi.readFileSync', '/file.ts')
  expect(state.hashes).toBe(2)
  expect(state.reads).toBe(3)
})

test('a previously missing directory becoming available invalidates resolution even without a file hash', () => {
  const { client, fs, state } = fixture()
  state.hash = null
  state.missing = true
  const cached = createCachedClient(client, fs, cache(), cache())
  expect(cached.invokeSync('SyncApi.exists', '/node_modules/new-package')).toBe(false)
  expect(cached.refresh?.()).toBe(false)
  state.missing = false
  expect(cached.refresh?.()).toBe(true)
})

test('retiring project references stops polling their identities without closing journals', () => {
  const { client, fs, state } = fixture()
  const cached = createCachedClient(client, fs, cache(), cache())
  cached.invokeSync('SyncApi.readFileSync', '/project/file.ts')
  cached.invokeSync('SyncApi.readDirSync', '/project')
  state.missing = true
  cached.invokeSync('SyncApi.exists', '/project/missing.ts')
  cached.forgetReferences?.(['/project/file.ts', '/project', '/project/missing.ts'])
  state.failedHash = true
  expect(cached.refresh?.()).toBe(false)
  state.failedHash = false
  state.missing = false
  cached.invokeSync('SyncApi.readFileSync', '/project/file.ts')
  cached.clearReferences?.()
  state.failedHash = true
  expect(cached.refresh?.()).toBe(false)
})
