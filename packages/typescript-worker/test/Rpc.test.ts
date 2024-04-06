import { expect, jest, test } from '@jest/globals'
import * as Rpc from '../src/parts/Rpc/Rpc.ts'

test('invoke', async () => {
  globalThis.rpc = {
    invoke: jest.fn(() => {
      return 1
    }),
  }
  expect(await Rpc.invoke('test')).toBe(1)
})
