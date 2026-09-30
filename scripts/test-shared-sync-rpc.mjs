import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Worker } from 'node:worker_threads'
import { writeSharedResult } from '../packages/extension/src/parts/WriteSharedResult/WriteSharedResult.ts'

const run = async (values, { maxDelay = 2000, respond = true } = {}) => {
  const worker = new Worker(new URL('./fixtures/shared-sync-rpc-worker.mjs', import.meta.url), {
    workerData: { calls: values.length, maxDelay },
  })
  const results = []
  const writes = []
  let setup
  try {
    await new Promise((resolve, reject) => {
      worker.on('error', reject)
      worker.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`Worker exited ${code}`))))
      worker.on('message', (message) => {
        if (message.method === 'SyncApi.setupShared') {
          setup = { shared: message.params[1], maxDelay: message.params[2] }
        } else if (message.method === 'test.read') {
          if (respond) {
            const value = values[message.params[1]]
            writes.push(writeSharedResult(setup, value.result, value.error))
          }
        } else {
          results.push(message)
        }
      })
    })
    await Promise.all(writes)
    return { results, setup }
  } finally {
    await worker.terminate()
  }
}

test('shared response bridge preserves large Unicode results, errors and subsequent requests', async () => {
  const values = [
    { result: false },
    { result: 'é😀'.repeat(100_000) },
    { error: new Error('read failed') },
    { result: ['a.ts', 'b.ts'] },
    { result: undefined },
  ]
  const { results } = await run(values)
  assert.deepEqual(results, [values[0], values[1], { error: 'read failed' }, values[3], values[4]])
})

test('timeout cancels the producer and prevents reuse of an unfinished request', async () => {
  const { results, setup } = await run([{}, {}], { maxDelay: 20, respond: false })
  assert.deepEqual(results, [
    { error: 'Rpc error: timeout of 20ms exceeded' },
    { error: 'Synchronous RPC client is unavailable after a timeout' },
  ])
  await writeSharedResult(setup, 'late result', undefined)
  assert.equal(Atomics.load(new Int32Array(setup.shared), 0), 3)
})

test('a producer stops waiting when its consumer disappears between chunks', async () => {
  const shared = new SharedArrayBuffer(16)
  await writeSharedResult({ shared, maxDelay: 5 }, 'a response longer than one chunk', undefined)
  assert.equal(Atomics.load(new Int32Array(shared), 0), 1)
})
