import { test, expect, jest } from '@jest/globals'
import * as WaitForSyncRpcResultFile from '../src/parts/WaitForSyncRpcResultFile/WaitForSyncRpcResultFile.ts'
import * as WaitForSyncBufferResultType from '../src/parts/WaitForSyncBufferResultType/WaitForSyncBufferResultType.ts'

test('waitForSyncRpcResultFile - success', () => {
  const mockHandle = {
    read: jest.fn((buffer: Uint8Array) => {
      buffer[0] = 1 // Ready
    }),
  } as unknown as FileSystemSyncAccessHandle
  const maxWaitTime = 1000

  const result = WaitForSyncRpcResultFile.waitForSyncRpcResultFile(mockHandle, maxWaitTime)

  expect(result).toBe(WaitForSyncBufferResultType.Ok)
  expect(mockHandle.read).toHaveBeenCalled()
})

test('waitForSyncRpcResultFile - timeout', () => {
  const mockHandle = {
    read: jest.fn((buffer: Uint8Array) => {
      buffer[0] = 0 // Not ready
    }),
  } as unknown as FileSystemSyncAccessHandle
  const maxWaitTime = 10 // Very short timeout

  const result = WaitForSyncRpcResultFile.waitForSyncRpcResultFile(mockHandle, maxWaitTime)

  expect(result).toBe(WaitForSyncBufferResultType.Timeout)
  expect(mockHandle.read).toHaveBeenCalled()
})

test('waitForSyncRpcResultFile - multiple reads until success', () => {
  let readCount = 0
  const mockHandle = {
    read: jest.fn((buffer: Uint8Array) => {
      readCount++
      if (readCount < 3) {
        buffer[0] = 0 // Not ready for first 2 calls
      } else {
        buffer[0] = 1 // Ready on 3rd call
      }
    }),
  } as unknown as FileSystemSyncAccessHandle
  const maxWaitTime = 1000

  const result = WaitForSyncRpcResultFile.waitForSyncRpcResultFile(mockHandle, maxWaitTime)

  expect(result).toBe(WaitForSyncBufferResultType.Ok)
  expect(mockHandle.read).toHaveBeenCalledTimes(3)
})
