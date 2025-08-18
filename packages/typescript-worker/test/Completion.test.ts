import { expect, jest, test } from '@jest/globals'
import type { CommonRpc } from '../src/parts/CommonRpc/CommonRpc.ts'
import * as Completion from '../src/parts/Completion/Completion.ts'

test.skip('getCompletion', async () => {
  const typeScriptRpc: CommonRpc = {
    invoke: jest.fn(async () => {
      return {
        entries: [],
      } as any
    }),
  }
  const Position = {
    getTsPosition() {
      return {
        line: 0,
        column: 0,
      }
    },
  }
  const textDocument = {
    uri: '',
  }
  const offset = 0
  expect(await Completion.getCompletion(typeScriptRpc, Position, textDocument, offset)).toEqual([])
})
