import { test, expect, jest } from '@jest/globals'
import * as WaitForSyncRpcResultBuffer from '../src/parts/WaitForSyncRpcResultBuffer/WaitForSyncRpcResultBuffer.ts'
import * as WaitForSyncBufferResultType from '../src/parts/WaitForSyncBufferResultType/WaitForSyncBufferResultType.ts'

test('waitForSyncRpcResultBuffer - ok result', () => {
  const maxWaitTime = 1000
  const sharedBuffer = new Int32Array(1)

  // Mock Atomics.wait to return 'ok'
  const originalAtomicsWait = Atomics.wait
  Atomics.wait = jest.fn(() => 'ok' as const)

  const result = WaitForSyncRpcResultBuffer.waitForSyncRpcResultBuffer(maxWaitTime, sharedBuffer)

  expect(result).toBe(WaitForSyncBufferResultType.Ok)
  expect(Atomics.wait).toHaveBeenCalledWith(sharedBuffer, 0, 0, maxWaitTime)

  // Restore original function
  Atomics.wait = originalAtomicsWait
})

test('waitForSyncRpcResultBuffer - not-equal result', () => {
  const maxWaitTime = 1000
  const sharedBuffer = new Int32Array(1)

  // Mock Atomics.wait to return 'not-equal'
  const originalAtomicsWait = Atomics.wait
  Atomics.wait = jest.fn(() => 'not-equal' as const)

  const result = WaitForSyncRpcResultBuffer.waitForSyncRpcResultBuffer(maxWaitTime, sharedBuffer)

  expect(result).toBe(WaitForSyncBufferResultType.NotEqual)
  expect(Atomics.wait).toHaveBeenCalledWith(sharedBuffer, 0, 0, maxWaitTime)

  // Restore original function
  Atomics.wait = originalAtomicsWait
})

test('waitForSyncRpcResultBuffer - timed-out result', () => {
  const maxWaitTime = 1000
  const sharedBuffer = new Int32Array(1)

  // Mock Atomics.wait to return 'timed-out'
  const originalAtomicsWait = Atomics.wait
  Atomics.wait = jest.fn(() => 'timed-out' as const)

  const result = WaitForSyncRpcResultBuffer.waitForSyncRpcResultBuffer(maxWaitTime, sharedBuffer)

  expect(result).toBe(WaitForSyncBufferResultType.Timeout)
  expect(Atomics.wait).toHaveBeenCalledWith(sharedBuffer, 0, 0, maxWaitTime)

  // Restore original function
  Atomics.wait = originalAtomicsWait
})

test('waitForSyncRpcResultBuffer - other result', () => {
  const maxWaitTime = 1000
  const sharedBuffer = new Int32Array(1)

  // Mock Atomics.wait to return 'other' (unexpected value)
  const originalAtomicsWait = Atomics.wait
  Atomics.wait = jest.fn(() => 'other' as any)

  const result = WaitForSyncRpcResultBuffer.waitForSyncRpcResultBuffer(maxWaitTime, sharedBuffer)

  expect(result).toBe(WaitForSyncBufferResultType.Other)
  expect(Atomics.wait).toHaveBeenCalledWith(sharedBuffer, 0, 0, maxWaitTime)

  // Restore original function
  Atomics.wait = originalAtomicsWait
})
