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

const Completion = await import('../src/parts/Completion/Completion.ts')
const TypeScriptRpc = await import('../src/parts/TypeScriptRpc/TypeScriptRpc.ts')
const Rpc = await import('../src/parts/Rpc/Rpc.ts')

test('getCompletion', async () => {
  jest.spyOn(TypeScriptRpc, 'invoke').mockImplementation(async (method) => {
    if (method === 'Completion.getCompletion') {
      return {
        entries: [],
      }
    }
  })
  jest.spyOn(Rpc, 'invoke').mockImplementation(async (method) => {
    if (method === 'Position.getPosition') {
      return {
        rowIndex: 0,
        columnIndex: 0,
      }
    }
  })
  const textDocument = {
    uri: '',
  }
  const offset = 0
  expect(await Completion.getCompletion(textDocument, offset)).toEqual([])
})
