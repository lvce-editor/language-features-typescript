import { afterEach, beforeEach, expect, jest, test } from '@jest/globals'
import { createSharedSyncRpcClient } from '../src/parts/CreateSharedSyncRpcClient/CreateSharedSyncRpcClient.ts'

const state: { shared: SharedArrayBuffer } = { shared: new SharedArrayBuffer(8) }
const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator')
const defaultTextAccessHandle = {
  flush: jest.fn(),
  getSize: () => 0,
  read: jest.fn(),
  truncate: jest.fn(),
  write: jest.fn(),
}
const defaultTextHandle = { createSyncAccessHandle: async () => defaultTextAccessHandle }
beforeEach(() => {
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { storage: { getDirectory: async () => ({ getFileHandle: async () => defaultTextHandle }) } },
  })
})
const configure = (respond: () => void) => {
  globalThis.rpc = {
    invoke: jest.fn(async (method: string, _id: number, buffer: SharedArrayBuffer) => {
      if (method === 'SyncApi.setupShared') {
        state.shared = buffer
      } else {
        respond()
      }
    }),
  }
}
const respond = (content: string, status = 2) => {
  const bytes = new TextEncoder().encode(content)
  new Uint8Array(state.shared, 8).set(bytes)
  const header = new Int32Array(state.shared, 0, 2)
  Atomics.store(header, 1, bytes.length)
  Atomics.store(header, 0, status)
}

afterEach(() => {
  jest.restoreAllMocks()
  if (originalNavigator) {
    Object.defineProperty(globalThis, 'navigator', originalNavigator)
  } else {
    Reflect.deleteProperty(globalThis, 'navigator')
  }
})

test('reads large Unicode file text from OPFS without putting it in the shared response', async () => {
  let fileBytes = new Uint8Array()
  const textAccessHandle = {
    flush: jest.fn(),
    getSize: () => fileBytes.length,
    read: jest.fn((target: Uint8Array) => {
      target.set(fileBytes)
      return fileBytes.length
    }),
    truncate: (size: number) => {
      fileBytes = fileBytes.slice(0, size)
    },
    write: (source: Uint8Array) => {
      fileBytes = source.slice()
      return source.length
    },
  }
  const textHandle = { createSyncAccessHandle: async () => textAccessHandle }
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { storage: { getDirectory: async () => ({ getFileHandle: async () => textHandle }) } },
  })
  globalThis.rpc = {
    invoke: jest.fn(async (method: string, _id: number, shared: SharedArrayBuffer) => {
      if (method === 'SyncApi.setupShared') {
        state.shared = shared
        return
      }
      fileBytes = new TextEncoder().encode(text)
      respond(JSON.stringify({ text: true }))
    }),
  }
  const text = 'const greeting = "héllo 😀"\n'.repeat(10_000)
  try {
    const client = await createSharedSyncRpcClient(7, 100)
    expect(client.invokeSync('SyncApi.readFileSync', '/large.ts')).toBe(text)
    expect(textAccessHandle.read).toHaveBeenCalled()
  } finally {
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: { storage: { getDirectory: async () => ({ getFileHandle: async () => defaultTextHandle }) } },
    })
  }
})

test('returns a response published before the synchronous wait begins', async () => {
  configure(() => respond(JSON.stringify({ result: ['file.ts'] })))
  const client = await createSharedSyncRpcClient(7, 100)
  expect(client.invokeSync('SyncApi.readDirSync', '/workspace')).toEqual(['file.ts'])
})

test('decodes successive response chunks', async () => {
  configure(() => respond('{"result":', 1))
  const client = await createSharedSyncRpcClient(7, 100)
  const { wait } = Atomics
  let calls = 0
  jest.spyOn(Atomics, 'wait').mockImplementation((...args) => {
    if (calls++ === 1) {
      respond('42}')
    }
    return wait(...args)
  })
  expect(client.invokeSync('SyncApi.readFileSync')).toBe(42)
})

test('propagates a remote failure and permits the next request', async () => {
  configure(() => respond(JSON.stringify({ error: { message: 'file missing' } })))
  const client = await createSharedSyncRpcClient(7, 100)
  expect(() => client.invokeSync('SyncApi.readFileSync')).toThrow('file missing')
  expect(() => client.invokeSync('SyncApi.readFileSync')).toThrow('file missing')
})

test.each([0, 5])('cancels timed out requests with a %sms deadline', async (maxDelay) => {
  configure(() => {})
  const client = await createSharedSyncRpcClient(7, maxDelay)
  expect(() => client.invokeSync('SyncApi.readFileSync')).toThrow(`timeout of ${maxDelay}ms exceeded`)
  expect(Atomics.load(new Int32Array(state.shared), 0)).toBe(3)
  expect(() => client.invokeSync('SyncApi.readFileSync')).toThrow('unavailable after a timeout')
})
