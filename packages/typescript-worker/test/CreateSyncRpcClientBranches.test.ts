import { afterEach, expect, jest, test } from '@jest/globals'

let bufferResult: Uint8Array | undefined = new Uint8Array(4)
let resultType = 0
let errorSize = 0
const result = { value: 42 }
const parsedError = { message: 'remote error' }
const readJsonFromHandle = jest.fn((_handle: unknown, _size: number) => result as unknown)
const invoke = jest.fn(async (..._args: unknown[]) => undefined)
const waitForSyncRpcResult = jest.fn(
  (_handle: unknown, _maxDelay: number, _buffer: Uint8Array | undefined) => resultType,
)

jest.unstable_mockModule('../src/parts/CreateBuffer/CreateBuffer.ts', () => ({
  createBuffer: jest.fn(() => bufferResult),
}))
jest.unstable_mockModule('../src/parts/ReadJsonFromHandle/ReadJsonFromHandle.ts', () => ({ readJsonFromHandle }))
jest.unstable_mockModule('../src/parts/Rpc/Rpc.ts', () => ({ invoke }))
jest.unstable_mockModule('../src/parts/WaitForSyncRpcResult/WaitForSyncRpcResult.ts', () => ({ waitForSyncRpcResult }))

const { createSyncRpcClient } = await import('../src/parts/CreateSyncRpcClient/CreateSyncRpcClient.ts')

const createHandle = (size = 0) => ({
  createSyncAccessHandle: jest.fn(async (_options: { mode: string }) => ({
    flush: jest.fn(),
    getSize: jest.fn(() => size),
    truncate: jest.fn(),
    write: jest.fn(),
  })),
})

const setupClient = async () => {
  const draft = createHandle()
  const resultFile = createHandle(5)
  const errorFile = createHandle(errorSize)
  const handles: Record<string, ReturnType<typeof createHandle>> = {
    'draft.txt': draft,
    'result.txt': resultFile,
    'error.txt': errorFile,
  }
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: {
      storage: {
        getDirectory: async () => ({
          getFileHandle: async (name: string) => handles[name],
        }),
      },
    },
  })
  const client = await createSyncRpcClient({ crossOriginIsolated: false, maxDelay: 20, syncId: 7 })
  return { client, draft, errorFile, resultFile }
}

const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
afterEach(() => {
  if (originalNavigator) {
    Object.defineProperty(globalThis, 'navigator', originalNavigator)
  } else {
    Reflect.deleteProperty(globalThis, 'navigator')
  }
  bufferResult = new Uint8Array(4)
  resultType = 0
  errorSize = 0
  jest.clearAllMocks()
})

test('sets up the shared handles and returns parsed synchronous results', async () => {
  const { client, draft } = await setupClient()

  expect(await client.invokeSync('SyncApi.exists', '/file.ts')).toEqual(result)
  expect(invoke).toHaveBeenCalledWith(
    'SyncApi.setup',
    7,
    bufferResult,
    'draft.txt',
    'result.txt',
    'error.txt',
    expect.any(Object),
    expect.any(Object),
    expect.any(Object),
  )
  expect(waitForSyncRpcResult).toHaveBeenCalledWith(expect.any(Object), 20, bufferResult)
  expect(draft.createSyncAccessHandle).toHaveBeenCalledWith({ mode: 'readwrite-unsafe' })
  expect(readJsonFromHandle).toHaveBeenCalledWith(expect.any(Object), 5)
})

test.each([
  [2, 'timeout of 20ms exceeded'],
  [1, 'Buffer did not change'],
  [3, 'Unexpected buffer error'],
])('throws a descriptive error when the synchronous result type is %s', async (nextType, message) => {
  resultType = nextType
  const { client } = await setupClient()

  expect(() => client.invokeSync('SyncApi.exists')).toThrow(`Rpc error: ${message}`)
})

test('throws the remote error message when the error file has content', async () => {
  errorSize = 4
  readJsonFromHandle.mockReturnValueOnce(parsedError)
  const { client, errorFile } = await setupClient()

  expect(() => client.invokeSync('SyncApi.readFileSync')).toThrow('remote error')
  expect(errorFile).toBeDefined()
  expect(readJsonFromHandle).toHaveBeenCalledWith(expect.any(Object), 4)
})

test('supports browsers where shared atomic buffers are unavailable', async () => {
  bufferResult = undefined
  const { client } = await setupClient()

  expect(await client.invokeSync('SyncApi.readDirSync')).toEqual(result)
  expect(waitForSyncRpcResult).toHaveBeenCalledWith(expect.any(Object), 20, undefined)
})
