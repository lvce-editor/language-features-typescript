import { beforeEach, expect, jest, test } from '@jest/globals'
import type * as Protocol from '../src/parts/TypeScriptProtocol/TypeScriptProtocol.ts'

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

const GetImplementationFromTsResult = await import(
  '../src/parts/GetImplementationFromTsResult/GetImplementationFromTsResult.ts'
)
const TypeScriptRpc = await import('../src/parts/TypeScriptRpc/TypeScriptRpc.ts')
const Rpc = await import('../src/parts/Rpc/Rpc.ts')

test('getGetImplementationFromTsResult', async () => {
  jest.spyOn(TypeScriptRpc, 'invoke').mockImplementation(async (method) => {
    if (method === 'GetImplementationFromTsResult.getGetImplementationFromTsResult') {
      return {
        entries: [],
      }
    }
  })
  jest.spyOn(Rpc, 'invoke').mockImplementation(async (method) => {
    return 'abc'
  })
  const tsResult: Protocol.ImplementationResponse['body'] = [
    {
      end: {
        line: 1,
        offset: 1,
      },
      start: {
        line: 1,
        offset: 1,
      },
      file: '/test/index.ts',
    },
  ]
  expect(await GetImplementationFromTsResult.getImplementationsFromTsResult(tsResult)).toEqual([
    {
      endOffset: 0,
      lineText: 'abc',
      startOffset: 0,
      uri: '/test/index.ts',
    },
  ])
})

test('getGetImplementationFromTsResult - empty', async () => {
  jest.spyOn(TypeScriptRpc, 'invoke').mockImplementation(async (method) => {
    if (method === 'GetImplementationFromTsResult.getGetImplementationFromTsResult') {
      return undefined
    }
  })
  jest.spyOn(Rpc, 'invoke').mockImplementation(async (method) => {
    return 'abc'
  })
  const tsResult = undefined
  expect(await GetImplementationFromTsResult.getImplementationsFromTsResult(tsResult)).toEqual([])
})
