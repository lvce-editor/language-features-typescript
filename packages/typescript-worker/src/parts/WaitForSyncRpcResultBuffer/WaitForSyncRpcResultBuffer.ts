import * as WaitForSyncBufferResultType from '../WaitForSyncBufferResultType/WaitForSyncBufferResultType.ts'

export const waitForSyncRpcResultBuffer = (maxWaitTime: number, sharedBuffer: Int32Array): number => {
  const result = Atomics.wait(sharedBuffer, 0, 0, maxWaitTime)
  if (result === 'ok') {
    return WaitForSyncBufferResultType.Ok
  }
  if (result === 'not-equal') {
    return WaitForSyncBufferResultType.NotEqual
  }
  if (result === 'timed-out') {
    return WaitForSyncBufferResultType.Timeout
  }
  return WaitForSyncBufferResultType.Other
}
