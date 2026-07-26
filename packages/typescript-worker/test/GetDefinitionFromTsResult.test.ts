import { expect, test } from '@jest/globals'
import type * as TypeScriptProtocol from '../src/parts/TypeScriptProtocol/TypeScriptProtocol.ts'
import * as GetDefinitionFromTsResult from '../src/parts/GetDefinitionFromTsResult/GetDefinitionFromTsResult.ts'

test('getDefinitionFromTsResult', async () => {
  const Position = {
    getOffset() {
      return 0
    },
  }
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
  expect(await GetDefinitionFromTsResult.getDefinitionFromTsResult(textDocument, Position, tsResult)).toEqual({
    endOffset: 0,
    startOffset: 0,
    uri: '/test/index.ts',
  })
})

test('getDefinitionFromTsResult - empty', async () => {
  const Position = {
    getOffset() {
      return 0
    },
  }
  const textDocument = {
    uri: '/test/index.ts',
  }
  const tsResult: TypeScriptProtocol.DefinitionInfo[] = []
  expect(await GetDefinitionFromTsResult.getDefinitionFromTsResult(textDocument, Position, tsResult)).toBeUndefined()
})

test('getDefinitionFromTsResult - different file', async () => {
  const Position = {
    getOffset() {
      return 0
    },
  }
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
  expect(await GetDefinitionFromTsResult.getDefinitionFromTsResult(textDocument, Position, tsResult)).toEqual({
    endColumnIndex: 0,
    endOffset: 0,
    endRowIndex: 0,
    startColumnIndex: 0,
    startOffset: 0,
    startRowIndex: 0,
    uri: '/test/other.ts',
  })
})
