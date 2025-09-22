import { test, expect, jest } from '@jest/globals'
import * as WaitForSyncRpcResult from '../src/parts/WaitForSyncRpcResult/WaitForSyncRpcResult.ts'
import * as WaitForSyncBufferResultType from '../src/parts/WaitForSyncBufferResultType/WaitForSyncBufferResultType.ts'

test('waitForSyncRpcResult - with sharedBuffer', () => {
  const mockHandle = {} as FileSystemSyncAccessHandle
  const maxWaitTime = 1000
  const sharedBuffer = new Int32Array(1)

  // Mock Atomics.wait to return 'ok'
  const originalAtomicsWait = Atomics.wait
  Atomics.wait = jest.fn(() => 'ok' as const)

  const result = WaitForSyncRpcResult.waitForSyncRpcResult(mockHandle, maxWaitTime, sharedBuffer)

  expect(result).toBe(WaitForSyncBufferResultType.Ok)
  expect(Atomics.wait).toHaveBeenCalledWith(sharedBuffer, 0, 0, maxWaitTime)

  // Restore original function
  Atomics.wait = originalAtomicsWait
})

test('waitForSyncRpcResult - without sharedBuffer', () => {
  const mockHandle = {
    read: jest.fn((buffer: Uint8Array) => {
      buffer[0] = 1
    }),
  } as unknown as FileSystemSyncAccessHandle
  const maxWaitTime = 1000

  const result = WaitForSyncRpcResult.waitForSyncRpcResult(mockHandle, maxWaitTime, undefined)

  expect(result).toBe(WaitForSyncBufferResultType.Ok)
  expect(mockHandle.read).toHaveBeenCalled()
})

test('waitForSyncRpcResult - without sharedBuffer - timeout', () => {
  const mockHandle = {
    read: jest.fn((buffer: Uint8Array) => {
      buffer[0] = 0 // Not ready
    }),
  } as unknown as FileSystemSyncAccessHandle
  const maxWaitTime = 10 // Very short timeout

  const result = WaitForSyncRpcResult.waitForSyncRpcResult(mockHandle, maxWaitTime, undefined)

  expect(result).toBe(WaitForSyncBufferResultType.Timeout)
})
