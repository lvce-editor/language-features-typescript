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

const References = await import('../src/parts/References/References.ts')
const TypeScriptRpc = await import('../src/parts/TypeScriptRpc/TypeScriptRpc.ts')
const Rpc = await import('../src/parts/Rpc/Rpc.ts')

test('provideReferences', async () => {
  jest.spyOn(TypeScriptRpc, 'invoke').mockImplementation(async (method) => {
    if (method === 'References.getReferences') {
      return {
        refs: [],
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
  expect(await References.provideReferences(textDocument, offset)).toEqual([])
})

test('provideFileReferences', async () => {
  jest.spyOn(TypeScriptRpc, 'invoke').mockImplementation(async (method) => {
    if (method === 'References.getFileReferences') {
      return {
        refs: [],
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
  expect(await References.provideFileReferences(textDocument)).toEqual([])
})
