import { beforeEach, expect, jest, test } from '@jest/globals'
import type * as TypeScriptProtocol from '../src/parts/TypeScriptProtocol/TypeScriptProtocol.ts'

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

const GetDefinitionFromTsResult = await import('../src/parts/GetDefinitionFromTsResult/GetDefinitionFromTsResult.ts')
const Rpc = await import('../src/parts/Rpc/Rpc.ts')

test('getDefintionFromTsResult', async () => {
  jest.spyOn(Rpc, 'invoke').mockResolvedValue(0)
  const textDocument = {
    uri: '/test/index.ts',
  }
  const tsResult: TypeScriptProtocol.DefinitionInfo[] = [
    {
      end: {
        line: 1,
        offset: 1,
      },
      file: '/test/index.ts',
      start: {
        line: 1,
        offset: 1,
      },
    },
  ]
  expect(await GetDefinitionFromTsResult.getDefinitionFromTsResult(textDocument, tsResult)).toEqual({
    endOffset: 0,
    startOffset: 0,
    uri: '/test/index.ts',
  })
})

test('getDefintionFromTsResult - empty', async () => {
  jest.spyOn(Rpc, 'invoke').mockResolvedValue(0)
  const textDocument = {
    uri: '/test/index.ts',
  }
  const tsResult: TypeScriptProtocol.DefinitionInfo[] = []
  expect(await GetDefinitionFromTsResult.getDefinitionFromTsResult(textDocument, tsResult)).toBe(undefined)
})

test('getDefintionFromTsResult - different file', async () => {
  jest.spyOn(Rpc, 'invoke').mockResolvedValue(0)
  const textDocument = {
    uri: '/test/index.ts',
  }
  const tsResult: TypeScriptProtocol.DefinitionInfo[] = [
    {
      end: {
        line: 1,
        offset: 1,
      },
      file: '/test/other.ts',
      start: {
        line: 1,
        offset: 1,
      },
    },
  ]
  expect(await GetDefinitionFromTsResult.getDefinitionFromTsResult(textDocument, tsResult)).toEqual({
    endColumnIndex: 0,
    endOffset: 0,
    endRowIndex: 0,
    startColumnIndex: 0,
    startOffset: 0,
    startRowIndex: 0,
    uri: '/test/other.ts',
  })
})
