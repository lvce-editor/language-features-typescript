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
        column: 0,
        line: 0,
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
        column: 0,
        line: 0,
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
  ).toBeUndefined()
})

test('resolveCompletion uses the original TypeScript name, source, and data', async () => {
  const typeScriptRpc: CommonRpc = {
    invoke: jest.fn(async () => [{ kind: 'class', name: 'PositionalAudio' }] as any),
  }
  const Position = {
    getTsPosition() {
      return { column: 0, line: 0, offset: 0 }
    },
  }
  const completionItem = {
    completionName: 'PositionalAudio',
    completionSource: 'three/addons/audio/PositionalAudio.js',
    data: { exportName: 'PositionalAudio' },
  }

  await ResolveCompletion.resolveCompletion(
    typeScriptRpc,
    Position,
    { uri: '' },
    0,
    'PositionalAudio (three/addons/audio/PositionalAudio.js)',
    completionItem,
  )

  expect(typeScriptRpc.invoke).toHaveBeenLastCalledWith('ResolveCompletion.resolveCompletion', {
    entryNames: [
      {
        data: { exportName: 'PositionalAudio' },
        name: 'PositionalAudio',
        source: 'three/addons/audio/PositionalAudio.js',
      },
    ],
    file: '',
    line: 0,
    offset: 0,
  })
})
