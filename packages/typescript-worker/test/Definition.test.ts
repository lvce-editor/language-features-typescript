import { expect, jest, test } from '@jest/globals'
import type { CommonRpc } from '../src/parts/CommonRpc/CommonRpc.ts'
import * as Definition from '../src/parts/Definition/Definition.ts'

test.skip('getDefinition', async () => {
  const typeScriptRpc: CommonRpc = {
    invoke: jest.fn(async () => {
      return [] as any
    }),
  }
  const Position = {
    getTsPosition() {
      return {
        line: 1,
        column: 1,
      }
    },
    getOffset() {
      return 0
    },
  }
  const textDocument = {
    uri: '',
  }
  const offset = 0
  expect(await Definition.getDefinition(typeScriptRpc, Position, textDocument, offset)).toBe(undefined)
})
