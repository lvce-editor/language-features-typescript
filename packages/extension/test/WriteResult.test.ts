import { expect, jest, test } from '@jest/globals'
import * as SyncSetupState from '../src/parts/SyncSetupState/SyncSetupState.ts'
import { writeResult } from '../src/parts/WriteResult/WriteResult.ts'

const handle = () => ({ close: jest.fn(), flush: jest.fn(), truncate: jest.fn(), write: jest.fn() })

test('non-isolated raw responses are written to the same text handle the client reads', async () => {
  const accessHandle = handle()
  const resultAccessHandle = handle()
  const textAccessHandle = handle()
  const errorAccessHandle = handle()
  SyncSetupState.set(11, {
    accessHandle,
    resultAccessHandle,
    textAccessHandle,
    errorAccessHandle,
    buffer: undefined,
  } as any)
  await writeResult(11, async () => 'export const title = "😀"', true)
  expect(textAccessHandle.write).toHaveBeenCalledWith(new TextEncoder().encode('export const title = "😀"'), { at: 0 })
  expect(resultAccessHandle.write).not.toHaveBeenCalled()
  expect(accessHandle.write).toHaveBeenCalledWith(new Uint8Array([1, 125]), { at: 0 })
  SyncSetupState.remove(11)
})

test('JSON responses use the result handle and errors never publish a text response', async () => {
  const accessHandle = handle()
  const resultAccessHandle = handle()
  const textAccessHandle = handle()
  const errorAccessHandle = handle()
  SyncSetupState.set(12, {
    accessHandle,
    resultAccessHandle,
    textAccessHandle,
    errorAccessHandle,
    buffer: undefined,
  } as any)
  await writeResult(12, async () => ({ exists: true }))
  expect(resultAccessHandle.write).toHaveBeenCalledWith(new TextEncoder().encode('{"exists":true}'), { at: 0 })
  await writeResult(
    12,
    async () => {
      throw new Error('permission denied')
    },
    true,
  )
  expect(errorAccessHandle.write).toHaveBeenCalled()
  expect(textAccessHandle.write).not.toHaveBeenCalled()
  expect(accessHandle.write).toHaveBeenLastCalledWith(new Uint8Array([1, 124]), { at: 0 })
  SyncSetupState.remove(12)
})
