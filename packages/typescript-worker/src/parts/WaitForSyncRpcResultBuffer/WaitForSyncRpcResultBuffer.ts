export const waitForSyncRpcResultBuffer = (maxWaitTime: number, sharedBuffer: Int32Array): boolean => {
  const result = Atomics.wait(sharedBuffer, 0, 0, maxWaitTime)

  if (result === 'ok') {
    return true
  }
  if (result === 'not-equal') {
    return false
  }
  if (result === 'timed-out') {
    return false
  }
  return false
}
