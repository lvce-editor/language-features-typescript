import { expect, jest, test } from '@jest/globals'
import { createCachedClient, withRequestCache } from '../src/parts/SyncRpcCache/SyncRpcCache.ts'

test('coalesces positive and negative existence queries and file reads within a request', () => {
  const invokeSync = jest.fn((method: string, uri: string) =>
    method === 'SyncApi.exists' ? uri === '/present' : 'content',
  )
  const client = createCachedClient({ invokeSync })
  withRequestCache(() => {
    expect(client.invokeSync('SyncApi.exists', '/present')).toBe(true)
    expect(client.invokeSync('SyncApi.exists', '/present')).toBe(true)
    expect(client.invokeSync('SyncApi.exists', '/missing')).toBe(false)
    expect(client.invokeSync('SyncApi.exists', '/missing')).toBe(false)
    expect(client.invokeSync('SyncApi.readFileSync', '/present')).toBe('content')
    expect(client.invokeSync('SyncApi.readFileSync', '/present')).toBe('content')
  })
  expect(invokeSync).toHaveBeenCalledTimes(3)
})

test('does not retain results between requests or affect calls outside a request', () => {
  let content = 'before'
  const invokeSync = jest.fn(() => content)
  const client = createCachedClient({ invokeSync })
  withRequestCache(() => expect(client.invokeSync('SyncApi.readFileSync', '/file')).toBe('before'))
  content = 'after'
  withRequestCache(() => expect(client.invokeSync('SyncApi.readFileSync', '/file')).toBe('after'))
  client.invokeSync('SyncApi.readFileSync', '/file')
  client.invokeSync('SyncApi.readFileSync', '/file')
  expect(invokeSync).toHaveBeenCalledTimes(4)
})

test('does not cache exceptions or mutable directory results', () => {
  const invokeSync = jest
    .fn<(...params: readonly any[]) => any>()
    .mockImplementationOnce(() => {
      throw new Error('temporary')
    })
    .mockReturnValueOnce(undefined)
    .mockReturnValue([])
  const client = createCachedClient({ invokeSync })
  withRequestCache(() => {
    expect(() => client.invokeSync('SyncApi.readFileSync', '/file')).toThrow('temporary')
    expect(client.invokeSync('SyncApi.readFileSync', '/file')).toBeUndefined()
    expect(client.invokeSync('SyncApi.readFileSync', '/file')).toBeUndefined()
    client.invokeSync('SyncApi.readDirSync', '/directory')
    client.invokeSync('SyncApi.readDirSync', '/directory')
  })
  expect(invokeSync).toHaveBeenCalledTimes(4)
})

test('keeps clients separate and restores scope after a failed nested request', () => {
  const invokeA = jest.fn(() => 'a')
  const a = createCachedClient({ invokeSync: invokeA })
  const b = createCachedClient({ invokeSync: () => 'b' })
  withRequestCache(() => {
    expect(a.invokeSync('SyncApi.readFileSync', '/file')).toBe('a')
    expect(b.invokeSync('SyncApi.readFileSync', '/file')).toBe('b')
    expect(() =>
      withRequestCache(() => {
        throw new Error('nested')
      }),
    ).toThrow('nested')
    expect(a.invokeSync('SyncApi.readFileSync', '/file')).toBe('a')
  })
  a.invokeSync('SyncApi.readFileSync', '/file')
  expect(invokeA).toHaveBeenCalledTimes(2)
})
