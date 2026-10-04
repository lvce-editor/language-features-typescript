import { expect, jest, test } from '@jest/globals'

const getFileHashes = jest.fn<(uris: readonly string[]) => Promise<readonly (string | null)[]>>()
const readFile = jest.fn<(uri: string) => Promise<string>>()
jest.unstable_mockModule('@lvce-editor/api', () => ({ getCacheFileHandle: jest.fn(), getFileHashes, readFile }))
jest.unstable_mockModule('../src/parts/WriteResult/WriteResult.ts', () => ({ writeResult: jest.fn() }))
const { getIdentities } = await import('../src/parts/FileCacheApi/FileCacheApi.ts')

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
