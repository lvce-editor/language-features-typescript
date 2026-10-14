import { expect, test } from '@jest/globals'
import { createCachedClient } from '../src/parts/CachedFileClient/CachedFileClient.ts'
import { createFileSystem } from '../src/parts/CreateFileSystem/CreateFileSystem.ts'
import { createWatchClient, trackTransport } from '../src/parts/FileWatchClient/FileWatchClient.ts'

const fixture = () => {
  const state = { active: true, failHashes: false, revision: 0 }
  const files = new Map([
    ['file:///project/main.ts', 'original'],
    ['file:///project/node_modules/example/index.d.ts', 'original'],
    ['file:///project/node_modules/.package-lock.json', 'lock'],
  ])
  const methods: string[] = []
  const identities = new Map<string, string>()
  const identity = (content: string): string => {
    const previous = identities.get(content)
    if (previous) return previous
    const value = (identities.size + 1).toString(16).padStart(64, '0')
    identities.set(content, value)
    return value
  }
  const source = {
    invokeSync(method: string, ...params: readonly any[]): any {
      methods.push(method)
      const uri = params[0]
      switch (method) {
        case 'FileCache.getHashes':
          if (state.failHashes) throw new Error('hashes unavailable')
          return uri.map((path: string) => (files.has(path) ? identity(files.get(path)!) : null))
        case 'FileCache.getWatchState':
          return { ...state }
        case 'SyncApi.exists':
          return files.has(uri)
        case 'SyncApi.readDirSync':
          return files
            .keys()
            .filter((path) => path.startsWith(`${uri}/`))
            .map((path) => path.slice(uri.length + 1).split('/', 1)[0])
            .toArray()
        case 'SyncApi.readFileSync':
          return files.get(uri)
        default:
          throw new Error(`Unexpected method ${method}`)
      }
    },
  }
  const fs = createFileSystem()
  let disposed = 0
  const watched = createWatchClient(
    source,
    { active: true, files: ['file:///tsconfig.json'], id: 1, revision: 0, roots: ['file:///project/'] },
    () => {
      disposed++
    },
  )
  const client = createCachedClient(watched, fs, undefined, undefined)
  return { client, files, fs, getDisposed: () => disposed, methods, state, watched }
}

const probes = (methods: readonly string[]): readonly string[] =>
  methods.filter((method) => method !== 'FileCache.getWatchState')

test('unchanged warm requests make no filesystem or hash transport probes, including missing paths', () => {
  const { client, methods } = fixture()
  expect(client.invokeSync('SyncApi.readFileSync', 'file:///project/main.ts')).toBe('original')
  expect(client.invokeSync('SyncApi.exists', 'file:///project/missing.ts')).toBe(false)
  client.invokeSync('SyncApi.readDirSync', 'file:///project')
  const before = [...probes(methods)]
  for (let index = 0; index < 3; index++) {
    expect(client.refresh?.()).toBe(false)
    expect(client.invokeSync('SyncApi.exists', 'file:///project/missing.ts')).toBe(false)
    expect(client.invokeSync('SyncApi.readFileSync', 'file:///project/main.ts')).toBe('original')
    client.invokeSync('SyncApi.readDirSync', 'file:///project')
  }
  expect(probes(methods)).toEqual(before)
  expect(client.getCacheStatistics?.().transport?.['FileCache.getWatchState']).toBe(3)
})

test('file edits and missing-file creation invalidate content and resolution caches', () => {
  const { client, files, state } = fixture()
  client.invokeSync('SyncApi.readFileSync', 'file:///project/main.ts')
  expect(client.invokeSync('SyncApi.exists', 'file:///project/missing.ts')).toBe(false)
  files.set('file:///project/main.ts', 'changed')
  files.set('file:///project/missing.ts', 'created')
  state.revision++
  expect(client.refresh?.()).toBe(true)
  expect(client.getChangedFiles?.()).toBeUndefined()
  expect(client.invokeSync('SyncApi.readFileSync', 'file:///project/main.ts')).toBe('changed')
  expect(client.invokeSync('SyncApi.exists', 'file:///project/missing.ts')).toBe(true)
  files.delete('file:///project/main.ts')
  state.revision++
  expect(client.refresh?.()).toBe(true)
  expect(client.invokeSync('SyncApi.exists', 'file:///project/main.ts')).toBe(false)
})

test('dependency edits without lockfile changes stay correct after watcher failure', () => {
  const { client, files, state } = fixture()
  const uri = 'file:///project/node_modules/example/index.d.ts'
  expect(client.invokeSync('SyncApi.readFileSync', uri)).toBe('original')
  files.set(uri, 'changed')
  state.active = false
  expect(client.refresh?.()).toBe(true)
  expect(client.invokeSync('SyncApi.readFileSync', uri)).toBe('changed')
  files.set(uri, 'changed again')
  expect(client.refresh?.()).toBe(true)
  expect(client.invokeSync('SyncApi.readFileSync', uri)).toBe('changed again')
})

test('uncovered paths still validate identities and unsaved document contents override disk', () => {
  const { client, files, fs } = fixture()
  const uri = 'file:///outside/main.ts'
  files.set(uri, 'original')
  client.invokeSync('SyncApi.readFileSync', uri)
  files.set(uri, 'changed')
  expect(client.refresh?.()).toBe(true)
  expect(client.invokeSync('SyncApi.readFileSync', uri)).toBe('changed')
  fs.writeFile('file:///project/main.ts', 'unsaved')
  expect(client.invokeSync('SyncApi.readFileSync', 'file:///project/main.ts')).toBe('unsaved')
})

test('project reference cleanup releases in-memory cache entries and client disposal stops watching', () => {
  const { client, getDisposed, methods } = fixture()
  const uri = 'file:///project/main.ts'
  client.invokeSync('SyncApi.readFileSync', uri)
  client.forgetReferences?.([uri])
  client.invokeSync('SyncApi.readFileSync', uri)
  expect(methods.filter((method) => method === 'SyncApi.readFileSync')).toHaveLength(2)
  client.dispose?.()
  expect(getDisposed()).toBe(1)
})

test('healthy watches retain memory contents when optional hashing is unavailable', () => {
  const { client, files, methods, state } = fixture()
  state.failHashes = true
  const uri = 'file:///project/main.ts'
  expect(client.invokeSync('SyncApi.readFileSync', uri)).toBe('original')
  const before = probes(methods).length
  expect(client.refresh?.()).toBe(false)
  expect(client.invokeSync('SyncApi.readFileSync', uri)).toBe('original')
  expect(probes(methods)).toHaveLength(before)
  files.set(uri, 'changed')
  state.revision++
  expect(client.refresh?.()).toBe(true)
  expect(client.invokeSync('SyncApi.readFileSync', uri)).toBe('changed')
})

test.each([
  ['file:///project/', '/project/main.ts', 'file:///project/main.ts'],
  ['file:///C:/project/', 'C:\\project\\main.ts', 'file:///C:/project/main.ts'],
  ['file://server/share/', '\\\\server\\share\\main.ts', 'file://server/share/main.ts'],
])('watch coverage and memory contents normalize native paths under %s', (root, nativePath, uri) => {
  let reads = 0
  const watched = createWatchClient(
    {
      invokeSync: () => {
        reads++
        return 'contents'
      },
    },
    {
      active: true,
      files: [],
      id: 1,
      revision: 0,
      roots: [root],
    },
    () => {},
  )
  expect(watched.isWatchedPath?.(nativePath)).toBe(true)
  expect(watched.isWatchedPath?.('memfs:///unrelated')).toBe(false)
  expect(watched.invokeSync('SyncApi.readFileSync', nativePath)).toBe('contents')
  expect(watched.invokeSync('SyncApi.readFileSync', uri)).toBe('contents')
  expect(reads).toBe(1)
  watched.clearReferences?.()
  watched.invokeSync('SyncApi.readFileSync', uri)
  expect(reads).toBe(2)
})

test('transport evidence includes direct source reads outside the cache and failed calls', () => {
  const source = trackTransport({
    invokeSync: (method) => {
      if (method === 'failing') throw new Error('failed')
      return 'contents'
    },
  })
  const watched = createWatchClient(
    source,
    { active: true, files: [], id: 1, revision: 0, roots: ['file:///project/'] },
    () => {},
  )
  watched.invokeSync('SyncApi.readFileSync', 'file:///project/main.ts')
  watched.invokeSync('SyncApi.readFileSync', 'file:///project/main.ts')
  source.invokeSync('SyncApi.readFileSync', 'file:///project/main.ts')
  expect(() => source.invokeSync('failing')).toThrow('failed')
  expect(watched.getTransportStatistics?.()).toEqual({ failing: 1, 'SyncApi.readFileSync': 2 })
  const snapshot = watched.getTransportStatistics?.()
  source.invokeSync('SyncApi.readFileSync', 'file:///project/main.ts')
  expect(snapshot?.['SyncApi.readFileSync']).toBe(2)
  expect(watched.getTransportStatistics?.()['SyncApi.readFileSync']).toBe(3)
})

test('watch coverage normalizes URI escapes without merging distinct filenames or case', () => {
  const methods: string[] = []
  const watched = createWatchClient(
    {
      invokeSync: (method, uri) => {
        methods.push(method)
        return uri
      },
    },
    { active: true, files: [], id: 1, revision: 0, roots: ['file:///C:/Users/RUNNER%7E1/project/'] },
    () => {},
  )
  expect(watched.isWatchedPath?.('file:///C:/Users/RUNNER~1/project/value.ts')).toBe(true)
  expect(watched.isWatchedPath?.('file:///C:/Users/RUNNER%257E1/project/value.ts')).toBe(false)
  const uri = 'file:///C:/Users/RUNNER~1/project/value.ts'
  watched.invokeSync('SyncApi.readFileSync', uri)
  watched.invokeSync('SyncApi.readFileSync', uri.replace('~', '%7E'))
  expect(methods).toHaveLength(1)
  watched.invokeSync('SyncApi.readFileSync', uri.replace('value', 'Value'))
  expect(methods).toHaveLength(2)
})
