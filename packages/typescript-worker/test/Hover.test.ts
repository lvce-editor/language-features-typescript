import { expect, jest, test } from '@jest/globals'
import type { CommonRpc } from '../src/parts/CommonRpc/CommonRpc.ts'
import * as Hover from '../src/parts/Hover/Hover.ts'

test.skip('getHover', async () => {
  const typeScriptRpc: CommonRpc = {
    invoke: jest.fn(async () => {
      return {} as any
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
  expect(await Hover.getHover(typeScriptRpc, Position, textDocument, offset)).toEqual({
    displayString: undefined,
    documentation: undefined,
    languageId: 'typescript',
  })
})
