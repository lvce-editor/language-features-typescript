import { parentPort, workerData } from 'node:worker_threads'
import { createSharedSyncRpcClient } from '../../packages/typescript-worker/src/parts/CreateSharedSyncRpcClient/CreateSharedSyncRpcClient.ts'

globalThis.rpc = {
  invoke(method, ...params) {
    parentPort.postMessage({ method, params })
    return Promise.resolve()
  },
}
const client = await createSharedSyncRpcClient(1, workerData.maxDelay)
for (let index = 0; index < workerData.calls; index++) {
  try {
    parentPort.postMessage({ result: client.invokeSync('test.read', index) })
  } catch (error) {
    parentPort.postMessage({ error: error.message })
  }
}
