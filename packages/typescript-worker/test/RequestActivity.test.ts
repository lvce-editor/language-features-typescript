import { expect, test } from '@jest/globals'
import { isActive, retire, wrapRequest } from '../src/parts/RequestActivity/RequestActivity.ts'

test('failed and overlapping requests release retired resources only after the final lease', async () => {
  const pending = Promise.withResolvers<void>()
  let disposed = 0
  retire(() => disposed++)
  expect(disposed).toBe(1)
  const first = wrapRequest(async () => {
    await pending.promise
  })()
  const second = wrapRequest(async () => {
    retire(() => disposed++)
    throw new Error('failed conversion')
  })()
  await expect(second).rejects.toThrow('failed conversion')
  expect(isActive()).toBe(true)
  expect(disposed).toBe(1)
  pending.resolve()
  await first
  expect(isActive()).toBe(false)
  expect(disposed).toBe(2)
})
