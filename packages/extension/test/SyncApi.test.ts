import { beforeEach, expect, jest, test } from '@jest/globals'

const existsApi = jest.fn<() => Promise<boolean>>()
const writeResultValue = jest.fn()

jest.unstable_mockModule('@lvce-editor/api', () => ({
  exists: existsApi,
  readDirWithFileTypes: jest.fn(),
  readFile: jest.fn(),
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
