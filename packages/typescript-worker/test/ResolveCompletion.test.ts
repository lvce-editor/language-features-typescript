import { expect, jest, test } from '@jest/globals'
import type { CommonRpc } from '../src/parts/CommonRpc/CommonRpc.ts'
import * as ResolveCompletion from '../src/parts/ResolveCompletion/ResolveCompletion.ts'

test('resolveCompletion', async () => {
  const typeScriptRpc: CommonRpc = {
    invoke: jest.fn(async () => {
      return [
        {
          kind: 'abc',
        },
      ] as any
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
  const name = ''
  const completionItem = {}
  expect(
    await ResolveCompletion.resolveCompletion(typeScriptRpc, Position, textDocument, offset, name, completionItem),
  ).toEqual({})
})

test('resolveCompletion - no item', async () => {
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
  const offset = 0
  const name = ''
  const completionItem = undefined
  expect(
    await ResolveCompletion.resolveCompletion(typeScriptRpc, Position, textDocument, offset, name, completionItem),
  ).toEqual(undefined)
})
