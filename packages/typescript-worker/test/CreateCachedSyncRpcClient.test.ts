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
