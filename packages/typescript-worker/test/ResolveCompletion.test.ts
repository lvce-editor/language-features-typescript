import { beforeEach, expect, jest, test } from '@jest/globals'

beforeEach(() => {
  jest.resetAllMocks()
})

jest.unstable_mockModule('../src/parts/TypeScriptRpc/TypeScriptRpc.ts', () => {
  return {
    invoke: jest.fn(),
  }
})
jest.unstable_mockModule('../src/parts/Rpc/Rpc.ts', () => {
  return {
    invoke: jest.fn(),
  }
})

const ResolveCompletion = await import('../src/parts/ResolveCompletion/ResolveCompletion.ts')
const TypeScriptRpc = await import('../src/parts/TypeScriptRpc/TypeScriptRpc.ts')
const Rpc = await import('../src/parts/Rpc/Rpc.ts')

test('resolveCompletion', async () => {
  jest.spyOn(Rpc, 'invoke').mockResolvedValue({
    rowIndex: 0,
    columnIndex: 0,
  })
  jest.spyOn(TypeScriptRpc, 'invoke').mockImplementation(async (method) => {
    if (method === 'ResolveCompletion.resolveCompletion') {
      return {}
    }
  })
  const textDocument = {
    uri: '',
  }
  const offset = 0
  const name = ''
  const completionItem = {}
  expect(await ResolveCompletion.resolveCompletion(textDocument, offset, name, completionItem)).toEqual({})
})

test('resolveCompletion - no item', async () => {
  jest.spyOn(Rpc, 'invoke').mockResolvedValue({
    rowIndex: 0,
    columnIndex: 0,
  })
  jest.spyOn(TypeScriptRpc, 'invoke').mockImplementation(async (method) => {
    if (method === 'ResolveCompletion.resolveCompletion') {
      return {}
    }
  })
  const textDocument = {
    uri: '',
  }
  const offset = 0
  const name = ''
  const completionItem = undefined
  expect(await ResolveCompletion.resolveCompletion(textDocument, offset, name, completionItem)).toEqual({})
})
