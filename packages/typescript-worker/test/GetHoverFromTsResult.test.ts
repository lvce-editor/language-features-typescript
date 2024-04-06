import { expect, test } from '@jest/globals'
import * as GetHoverFromTsResult from '../src/parts/GetHoverFromTsResult/GetHoverFromTsResult.ts'
import type * as Protocol from '../src/parts/TypeScriptProtocol/TypeScriptProtocol.cts'

test('getHoverFromTsResult', () => {
  const tsResult: Protocol.QuickInfoResponseBody = {
    displayString: 'abc',
    documentation: 'def',
    start: {
      line: 1,
      offset: 1,
    },
    end: {
      line: 1,
      offset: 1,
    },
    kind: '' as Protocol.QuickInfoResponseBody['kind'],
    kindModifiers: '',
    tags: [],
  }
  expect(GetHoverFromTsResult.getHoverFromTsResult(tsResult)).toEqual({
    displayString: 'abc',
    documentation: 'def',
    languageId: 'typescript',
  })
})
