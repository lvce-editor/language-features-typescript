import { expect, jest, test } from '@jest/globals'
import type { CommonRpc } from '../src/parts/CommonRpc/CommonRpc.ts'
import * as Selection from '../src/parts/Selection/Selection.ts'

test('expandSelection', async () => {
  const typeScriptRpc: CommonRpc = {
    invoke: jest.fn(async () => {
      return [] as any
    }),
  }
  const Position = {}
  const textDocument = {
    uri: '',
  }
  const positions = new Uint32Array([0, 0, 1, 1])
  expect(await Selection.expandSelection(typeScriptRpc, Position, textDocument, positions)).toEqual([])
})
