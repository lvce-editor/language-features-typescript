import { expect, jest, test } from '@jest/globals'
import { createCachedSyncRpcClient } from '../src/parts/CreateCachedSyncRpcClient/CreateCachedSyncRpcClient.ts'

test('shares filesystem probes only within synchronous work', async () => {
  const invokeSync = jest.fn((method: string, path: string) => `${method}:${path}`)
  const client = createCachedSyncRpcClient({ invokeSync })
  for (let index = 0; index < 1000; index++) {
    expect(client.invokeSync('SyncApi.exists', '/project/package.json')).toBe('SyncApi.exists:/project/package.json')
    expect(client.invokeSync('SyncApi.readFileSync', '/project/package.json')).toBe(
      'SyncApi.readFileSync:/project/package.json',
    )
  }
  expect(invokeSync).toHaveBeenCalledTimes(2)
  await Promise.resolve()
  client.invokeSync('SyncApi.exists', '/project/package.json')
  client.invokeSync('SyncApi.readFileSync', '/project/package.json')
  expect(invokeSync).toHaveBeenCalledTimes(4)
})

test('caches missing files and observes creation after yielding', async () => {
  const state: { content: string | undefined; exists: boolean } = { content: undefined, exists: false }
  const invokeSync = jest.fn((method: string) => (method === 'SyncApi.exists' ? state.exists : state.content))
  const client = createCachedSyncRpcClient({ invokeSync })
  for (let index = 0; index < 2; index++) {
    expect(client.invokeSync('SyncApi.exists', '/project/new.ts')).toBe(false)
    expect(client.invokeSync('SyncApi.readFileSync', '/project/new.ts')).toBeUndefined()
  }
  expect(invokeSync).toHaveBeenCalledTimes(2)
  await Promise.resolve()
  state.exists = true
  state.content = 'export const value = 1'
  expect(client.invokeSync('SyncApi.exists', '/project/new.ts')).toBe(true)
  expect(client.invokeSync('SyncApi.readFileSync', '/project/new.ts')).toBe(state.content)
})

test('does not retain failures or cache other RPC methods and argument shapes', () => {
  const invokeSync = jest.fn((): undefined => {
    throw new Error('unavailable')
  })
  const client = createCachedSyncRpcClient({ invokeSync })
  for (let index = 0; index < 2; index++) {
    expect(() => client.invokeSync('SyncApi.exists', '/project/new.ts')).toThrow('unavailable')
  }
  expect(invokeSync).toHaveBeenCalledTimes(2)
  invokeSync.mockImplementation(() => undefined)
  for (let index = 0; index < 2; index++) {
    client.invokeSync('SyncApi.readDirSync', '/project')
    client.invokeSync('SyncApi.exists', 123)
    client.invokeSync('SyncApi.exists', '/project', true)
    client.invokeSync('SyncApi.exists')
  }
  expect(invokeSync).toHaveBeenCalledTimes(10)
})

test('deduplicates repeated TypeScript package lookups across project files', async () => {
  const ts = await import('typescript')
  const files = new Map([
    ['/workspace/node_modules/library/package.json', '{"types":"index.d.ts"}'],
    ['/workspace/node_modules/library/index.d.ts', 'export const value: number'],
  ])
  const directories = new Set([
    '/workspace',
    '/workspace/src',
    '/workspace/node_modules',
    '/workspace/node_modules/library',
  ])
  const invokeSync = jest.fn((method: string, path: string) => {
    if (method === 'SyncApi.exists') return files.has(path) || directories.has(path)
    return files.get(path)
  })
  const client = createCachedSyncRpcClient({ invokeSync })
  const host = {
    directoryExists: (path: string) => client.invokeSync('SyncApi.exists', path),
    fileExists: (path: string) => client.invokeSync('SyncApi.exists', path),
    readFile: (path: string) => client.invokeSync('SyncApi.readFileSync', path),
  }
  const options = { module: ts.ModuleKind.NodeNext, moduleResolution: ts.ModuleResolutionKind.NodeNext }
  for (let index = 0; index < 20; index++) {
    const result = ts.resolveModuleName('library', `/workspace/src/file${index}.ts`, options, host)
    expect(result.resolvedModule?.resolvedFileName).toBe('/workspace/node_modules/library/index.d.ts')
  }
  expect(invokeSync.mock.calls.length).toBeLessThan(50)
  await Promise.resolve()
  files.set('/workspace/node_modules/library/package.json', '{"types":"updated.d.ts"}')
  files.set('/workspace/node_modules/library/updated.d.ts', 'export const updated: number')
  expect(
    ts.resolveModuleName('library', '/workspace/src/main.ts', options, host).resolvedModule?.resolvedFileName,
  ).toBe('/workspace/node_modules/library/updated.d.ts')
})

test('directory snapshot eliminates different missing extension probes', () => {
  const invokeSync = jest.fn((method: string, _path: string) =>
    method === 'SyncApi.readDirSync' ? ['main.ts', 'link.ts'] : false,
  )
  const client = createCachedSyncRpcClient({ invokeSync })
  expect(client.invokeSync('SyncApi.exists', '/project/missing.ts')).toBe(false)
  expect(client.invokeSync('SyncApi.exists', '/project/missing.tsx')).toBe(false)
  expect(client.invokeSync('SyncApi.exists', '/project/missing.d.ts')).toBe(false)
  expect(invokeSync.mock.calls).toEqual([
    ['SyncApi.exists', '/project/missing.ts'],
    ['SyncApi.readDirSync', '/project/'],
  ])
  // A listed symlink can be dangling; listing alone must not return true.
  expect(client.invokeSync('SyncApi.exists', '/project/link.ts')).toBe(false)
  expect(invokeSync).toHaveBeenLastCalledWith('SyncApi.exists', '/project/link.ts')
})

test('existing config enumeration seeds negative probes and expires before changes', async () => {
  let entries = ['main.ts']
  const invokeSync = jest.fn((method: string, path: string) =>
    method === 'SyncApi.readDirSync' ? entries : entries.includes(path.slice(path.lastIndexOf('/') + 1)),
  )
  const client = createCachedSyncRpcClient({ invokeSync })
  client.invokeSync('SyncApi.readDirSync', 'memfs:///project')
  expect(client.invokeSync('SyncApi.exists', 'memfs:///project/new.ts')).toBe(false)
  expect(invokeSync).toHaveBeenCalledTimes(1)
  await Promise.resolve()
  entries = ['new.ts']
  expect(client.invokeSync('SyncApi.exists', 'memfs:///project/new.ts')).toBe(true)
  expect(client.invokeSync('SyncApi.exists', 'memfs:///project/main.ts')).toBe(false)
  expect(invokeSync).toHaveBeenCalledTimes(3)
})

test('listing failure falls back once and preserves exact queries', () => {
  const invokeSync = jest.fn((method: string, _path: string) => {
    if (method === 'SyncApi.readDirSync') throw new Error('denied')
    return true
  })
  const client = createCachedSyncRpcClient({ invokeSync })
  for (const name of ['a.ts', 'b.ts', 'c.ts'])
    expect(client.invokeSync('SyncApi.exists', `/project/${name}`)).toBe(true)
  expect(invokeSync).toHaveBeenCalledTimes(4)
})

test('case variants and Unicode do not introduce false negatives', () => {
  const invokeSync = jest.fn((method: string, _path: string) => (method === 'SyncApi.readDirSync' ? ['Main.ts'] : true))
  const client = createCachedSyncRpcClient({ invokeSync })
  client.invokeSync('SyncApi.readDirSync', 'C:/project/')
  expect(client.invokeSync('SyncApi.exists', 'C:/project/main.ts')).toBe(true)
  expect(invokeSync).toHaveBeenLastCalledWith('SyncApi.exists', 'C:/project/main.ts')
  client.invokeSync('SyncApi.readDirSync', 'html://host/project')
  expect(client.invokeSync('SyncApi.exists', 'html://host/project/caf%C3%A9.ts')).toBe(true)
  expect(invokeSync).toHaveBeenLastCalledWith('SyncApi.exists', 'html://host/project/caf%C3%A9.ts')
})

test('unsafe names and oversized listings use exact existence checks', () => {
  for (const entries of [['café.ts'], ['bad/name'], [123], Array.from({ length: 1025 }, (_, i) => `${i}.ts`)]) {
    const invokeSync = jest.fn((method: string, _path: string) => (method === 'SyncApi.readDirSync' ? entries : true))
    const client = createCachedSyncRpcClient({ invokeSync })
    client.invokeSync('SyncApi.readDirSync', '/project')
    expect(client.invokeSync('SyncApi.exists', '/project/absent.ts')).toBe(true)
    expect(invokeSync).toHaveBeenLastCalledWith('SyncApi.exists', '/project/absent.ts')
  }
})

test('ambiguous URI and non-hierarchical spellings bypass directory inference', () => {
  const invokeSync = jest.fn((_method: string, _path: string) => true)
  const client = createCachedSyncRpcClient({ invokeSync })
  for (const path of [
    'bare',
    '/project/',
    '/project/.',
    '/project/..',
    'C:\\project\\file.ts',
    'html://host/a.ts?version=1',
    'memfs:///a#b.ts',
    'memfs:///bad%name.ts',
    'memfs:///a%2Fb.ts',
  ]) {
    expect(client.invokeSync('SyncApi.exists', path)).toBe(true)
    expect(invokeSync).toHaveBeenLastCalledWith('SyncApi.exists', path)
  }
})

test('encoded URI names, roots and provider authorities remain separate', () => {
  const invokeSync = jest.fn((method: string, _path: string) =>
    method === 'SyncApi.readDirSync' ? ['space name.ts', 'percent%20.ts'] : true,
  )
  const client = createCachedSyncRpcClient({ invokeSync })
  client.invokeSync('SyncApi.readDirSync', 'memfs:///')
  expect(client.invokeSync('SyncApi.exists', 'memfs:///space%20name.ts')).toBe(true)
  expect(client.invokeSync('SyncApi.exists', 'memfs:///percent%2520.ts')).toBe(true)
  expect(client.invokeSync('SyncApi.exists', 'memfs:///missing.ts')).toBe(false)
  expect(client.invokeSync('SyncApi.exists', 'memfs://other/missing.ts')).toBe(true)
})
