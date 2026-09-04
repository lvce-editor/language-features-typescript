import { expect, test } from '@jest/globals'
import type * as Protocol from '../src/parts/TypeScriptProtocol/TypeScriptProtocol.ts'
import * as GetReferencesFromTsResult from '../src/parts/GetReferencesFromTsResult/GetReferencesFromTsResult.ts'

test('getReferencesFromTsResult', () => {
  const textDocument = {}
  const tsResult: Protocol.ReferencesResponseBody = {
    refs: [
      {
        end: {
          line: 1,
          offset: 1,
        },
        file: '/test/index.ts',
        isWriteAccess: false,
        start: {
          line: 1,
          offset: 1,
        },
      },
    ],
    symbolDisplayString: '',
    symbolName: '',
    symbolStartOffset: 0,
  }
  expect(GetReferencesFromTsResult.getReferencesFromTsResult(textDocument, tsResult)).toEqual([
    {
      endColumnIndex: 0,
      endRowIndex: 0,
      startColumnIndex: 0,
      startRowIndex: 0,
      uri: '/test/index.ts',
    },
  ])
})
