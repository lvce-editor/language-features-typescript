import { expect, jest, test } from '@jest/globals'
import ts from 'typescript'
import { createAsyncFileClient } from '../src/parts/CreateAsyncFileClient/CreateAsyncFileClient.ts'

const sourceUri = '/project/main.ts'

test('runs real TypeScript rename against asynchronously loaded source and refreshes the next request', async () => {
  let contents = 'export const value = 1; console.log(value)'
  const invoke = jest.fn(async (method: string, uri: string) => {
    if (method === 'FileSystem.exists') return uri === sourceUri
    if (method === 'FileSystem.readFile') return uri === sourceUri ? contents : undefined
    throw new Error(method)
  })
  const client = createAsyncFileClient(invoke)
  let service: ts.LanguageService | undefined
  const reset = () => {
    service?.dispose()
    service = undefined
  }
  const rename = async () => {
    const host: ts.LanguageServiceHost = {
      fileExists: (uri) => client.invokeSync('SyncApi.exists', uri),
      getCompilationSettings: () => ({ noLib: true }),
      getCurrentDirectory: () => '/project',
      getDefaultLibFileName: () => '',
      getScriptFileNames: () => [sourceUri],
      getScriptSnapshot: (uri) => {
        const text = client.invokeSync('SyncApi.readFileSync', uri)
        return text === undefined ? undefined : ts.ScriptSnapshot.fromString(text)
      },
      getScriptVersion: () => '1',
      readFile: (uri) => client.invokeSync('SyncApi.readFileSync', uri),
    }
    service = ts.createLanguageService(host)
    return service.findRenameLocations(sourceUri, contents.indexOf('value'), false, false)
  }
  const locations = await client.runRequest!(rename, reset)
  expect(locations.map((location: ts.RenameLocation) => location.textSpan.start)).toEqual([13, 36])
  contents = 'export const value = 1;'
  expect(await client.runRequest!(rename, reset)).toHaveLength(1)
  expect(invoke.mock.calls.filter(([method]) => method === 'FileSystem.readFile')).toHaveLength(2)
})

test('serializes callers, isolates their snapshots and recovers after rejection', async () => {
  const invoke = jest.fn(async () => 'content')
  const client = createAsyncFileClient(invoke)
  const order: string[] = []
  const reset = jest.fn()
  const first = client.runRequest!(async () => {
    order.push('first')
    client.invokeSync('SyncApi.readFileSync', '/file')
    throw new Error('failed query')
  }, reset)
  const second = client.runRequest!(async () => {
    order.push('second')
    return client.invokeSync('SyncApi.readFileSync', '/file')
  }, reset)
  await expect(first).rejects.toThrow('failed query')
  await expect(second).resolves.toBe('content')
  expect(order).toEqual(['first', 'first', 'second', 'second'])
  expect(client.invokeSync('SyncApi.readFileSync', '/file')).toBeUndefined()
  client.dispose!()
  await expect(client.runRequest!(async () => '', reset)).rejects.toThrow('disposed')
})

test('resolves directory, existence and workspace queries and preserves filesystem failures', async () => {
  const invoke = jest.fn(async (method: string) => {
    if (method === 'FileSystem.readDir')
      return [
        { name: 'src', type: 3 },
        { name: 'main.ts', type: 1 },
      ]
    if (method === 'FileSystem.exists') return true
    if (method === 'FileSystem.getWorkspaceUri') return '/project'
    throw new Error('unreadable')
  })
  const client = createAsyncFileClient(invoke)
  const methods = ['SyncApi.readDirSync', 'SyncApi.getDirectoriesSync', 'SyncApi.exists', 'SyncApi.getWorkspaceUri']
  const query = async () => methods.map((method) => client.invokeSync(method, '/project'))
  expect(await client.runRequest!(query, () => {})).toEqual([['src', 'main.ts'], ['src'], true, '/project'])
  await expect(
    client.runRequest!(
      async () => client.invokeSync('SyncApi.readFileSync', '/secret'),
      () => {},
    ),
  ).rejects.toThrow('unreadable')
  await expect(
    client.runRequest!(
      async () => client.invokeSync('unsupported'),
      () => {},
    ),
  ).rejects.toThrow('Unsupported')
})

test('stops a non-converging query and rejects requests disposed during filesystem reads', async () => {
  const client = createAsyncFileClient(async () => 'text')
  let version = 0
  await expect(
    client.runRequest!(
      async () => client.invokeSync('SyncApi.readFileSync', String(version++)),
      () => {},
    ),
  ).rejects.toThrow('did not converge')
  const closing = createAsyncFileClient(async () => {
    closing.dispose!()
    return 'text'
  })
  await expect(
    closing.runRequest!(
      async () => closing.invokeSync('SyncApi.readFileSync', '/file'),
      () => {},
    ),
  ).rejects.toThrow('disposed')
})
