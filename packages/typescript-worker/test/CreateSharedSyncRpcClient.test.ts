import { afterEach, expect, jest, test } from '@jest/globals'
import { createSharedSyncRpcClient } from '../src/parts/CreateSharedSyncRpcClient/CreateSharedSyncRpcClient.ts'

const state: { shared: SharedArrayBuffer } = { shared: new SharedArrayBuffer(8) }
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
