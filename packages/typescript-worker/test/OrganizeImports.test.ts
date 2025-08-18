import { expect, jest, test } from '@jest/globals'
import type { CommonRpc } from '../src/parts/CommonRpc/CommonRpc.ts'
import * as OrganizeImports from '../src/parts/OrganizeImports/OrganizeImports.ts'

test.skip('organizeImports', async () => {
  const typeScriptRpc: CommonRpc = {
    invoke: jest.fn(async () => {
      return [] as any
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
  expect(await OrganizeImports.organizeImports(typeScriptRpc, Position, textDocument)).toEqual([])
})
