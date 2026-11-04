import { beforeEach, expect, jest, test } from '@jest/globals'

const existsApi = jest.fn<(uri: string) => Promise<boolean>>()
const readFileApi = jest.fn<(uri: string) => Promise<string>>()
const writeResultValue = jest.fn()
const readDirApi = jest.fn<() => Promise<readonly { name: string; type: number }[]>>()

jest.unstable_mockModule('@lvce-editor/api', () => ({
  exists: existsApi,
  getWorkspaceUri: jest.fn(async () => 'file:///workspace'),
  readDirWithFileTypes: readDirApi,
  readFile: readFileApi,
}))

jest.unstable_mockModule('../src/parts/WriteResult/WriteResult.ts', () => ({
  writeResult: async (_id: number, resultGenerator: () => Promise<unknown>) => {
    writeResultValue(await resultGenerator())
  },
}))

const SyncApi = await import('../src/parts/SyncApi/SyncApi.ts')

beforeEach(() => {
  jest.clearAllMocks()
})

test('directory enumeration excludes files and preserves empty directories', async () => {
  readDirApi.mockResolvedValue([
    { name: 'main.ts', type: 1 },
    { name: 'node_modules', type: 3 },
    { name: 'empty', type: 3 },
  ])
  await SyncApi.getDirectoriesSync(1, '/workspace')
  expect(writeResultValue).toHaveBeenCalledWith(['node_modules', 'empty'])
})

test('exists writes false when checking a missing file throws', async () => {
  existsApi.mockRejectedValue(new Error('file not found'))

  await SyncApi.exists(1, '/workspace/node_modules/package/types.d.ts')

  expect(writeResultValue).toHaveBeenCalledWith(false)
})

test('exists writes the filesystem result', async () => {
  existsApi.mockResolvedValue(true)

  await SyncApi.exists(1, '/workspace/src/main.ts')

  expect(writeResultValue).toHaveBeenCalledWith(true)
})

test('exists preserves remote filesystem uris', async () => {
  existsApi.mockResolvedValue(true)
  const uri = 'remote-ssh://simon@host/workspace/src/main.ts'

  await SyncApi.exists(1, uri)

  expect(existsApi).toHaveBeenCalledWith(uri)
  expect(writeResultValue).toHaveBeenCalledWith(true)
})

test('TS7 distinguishes missing files from filesystem failures', async () => {
  readFileApi.mockRejectedValueOnce(new Error('ENOENT: no such file'))
  await SyncApi.readFileOptional(1, 'memfs:///missing.ts')
  expect(writeResultValue).toHaveBeenCalledWith(null)
  readFileApi.mockRejectedValueOnce(new Error('permission denied'))
  await expect(SyncApi.readFileOptional(1, 'memfs:///secret.ts')).rejects.toThrow('permission denied')
  readFileApi.mockResolvedValueOnce('export const valid = 1')
  await SyncApi.readFileOptional(1, 'memfs:///valid.ts')
  expect(writeResultValue).toHaveBeenLastCalledWith('export const valid = 1')
})

test('TS7 directory results preserve file and directory kinds', async () => {
  readDirApi.mockResolvedValueOnce([
    { name: 'main.ts', type: 1 },
    { name: 'src', type: 3 },
  ])
  await SyncApi.readDirectoryEntries(1, 'memfs:///workspace')
  expect(writeResultValue).toHaveBeenCalledWith({ directories: ['src'], files: ['main.ts'] })
  readDirApi.mockRejectedValueOnce(new Error('ENOENT'))
  await SyncApi.readDirectoryEntries(1, 'memfs:///missing')
  expect(writeResultValue).toHaveBeenLastCalledWith(null)
  readDirApi.mockRejectedValueOnce(new Error('connection unavailable'))
  await expect(SyncApi.readDirectoryEntries(1, 'memfs:///workspace')).rejects.toThrow('connection unavailable')
})
