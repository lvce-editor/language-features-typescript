import { expect, jest, test } from '@jest/globals'

const getFileHashes = jest.fn<(uris: readonly string[]) => Promise<readonly (string | null)[]>>()
const readFile = jest.fn<(uri: string) => Promise<string>>()
const exists = jest.fn<(uri: string) => Promise<boolean>>()
const readDirWithFileTypes = jest.fn<(uri: string) => Promise<readonly { name: string }[]>>()
const results = new Map<number, unknown>()
const writeResult = jest.fn(async (_id: number, getResult: () => Promise<unknown>) => {
  results.set(_id, await getResult())
})
jest.unstable_mockModule('@lvce-editor/api', () => ({
  exists,
  getCacheFileHandle: jest.fn(),
  getFileHashes,
  readDirWithFileTypes,
  readFile,
}))
jest.unstable_mockModule('../src/parts/WriteResult/WriteResult.ts', () => ({ writeResult }))
const { getIdentities, getValidation } = await import('../src/parts/FileCacheApi/FileCacheApi.ts')

test('uses disk identities without reading contents, and hashes unsupported custom providers', async () => {
  const hash = 'a'.repeat(64)
  getFileHashes.mockResolvedValue([hash, null])
  readFile.mockImplementation(async (uri) => {
    if (uri === 'memfs:///empty') return ''
    throw new Error('Not found')
  })
  expect(
    await getIdentities(['/project/file.ts', '/project/missing.ts', 'memfs:///empty', 'memfs:///missing']),
  ).toEqual([hash, null, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', null])
  expect(getFileHashes).toHaveBeenCalledWith(['file:///project/file.ts', 'file:///project/missing.ts'])
  expect(readFile.mock.calls.map((call) => call[0])).toEqual(['memfs:///empty', 'memfs:///missing'])
})

test('validates batched resolution facts in input order with bounded concurrency and provider URI handling', async () => {
  let active = 0
  let maxActive = 0
  readDirWithFileTypes.mockImplementation(async (uri) => {
    active++
    maxActive = Math.max(active, maxActive)
    await new Promise((resolve) => setTimeout(resolve, uri.includes('slow') ? 2 : 0))
    active--
    return [{ name: uri }]
  })
  exists.mockImplementation(async (uri) => uri.endsWith('/created.ts'))
  const directories = Array.from({ length: 20 }, (_, index) => (index === 0 ? 'memfs:///slow' : `/project/${index}`))
  const missing = ['/project/missing.ts', 'memfs:///created.ts']
  const toUri = (uri: string) => (uri.startsWith('memfs:') ? uri : `file://${uri}`)
  await getValidation(7, directories, missing)
  expect(results.get(7)).toEqual({
    available: [false, true],
    entries: directories.map((uri) => [toUri(uri)]),
  })
  expect(maxActive).toBeLessThanOrEqual(16)
  expect(readDirWithFileTypes.mock.calls.map(([uri]) => uri)).toContain('memfs:///slow')
  expect(readDirWithFileTypes.mock.calls.map(([uri]) => uri)).toContain('file:///project/19')
  expect(exists.mock.calls.map(([uri]) => uri)).toEqual(['file:///project/missing.ts', 'memfs:///created.ts'])
})

test('validates empty batches without issuing filesystem requests', async () => {
  readDirWithFileTypes.mockClear()
  exists.mockClear()
  await getValidation(8, [], [])
  expect(results.get(8)).toEqual({ available: [], entries: [] })
  expect(readDirWithFileTypes).not.toHaveBeenCalled()
  expect(exists).not.toHaveBeenCalled()
})

test('propagates resolution validation failures instead of treating them as missing files', async () => {
  exists.mockRejectedValueOnce(new Error('Filesystem unavailable'))
  await expect(getValidation(9, [], ['/project/missing.ts'])).rejects.toThrow('Filesystem unavailable')
})
