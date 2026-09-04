import { expect, test } from '@jest/globals'
import type * as Protocol from '../src/parts/TypeScriptProtocol/TypeScriptProtocol.ts'
import * as GetHoverFromTsResult from '../src/parts/GetHoverFromTsResult/GetHoverFromTsResult.ts'

test('getHoverFromTsResult', () => {
  const tsResult: Protocol.QuickInfoResponseBody = {
    displayString: 'abc',
    documentation: 'def',
    end: {
      line: 1,
      offset: 1,
    },
    kind: '' as Protocol.QuickInfoResponseBody['kind'],
    kindModifiers: '',
    start: {
      line: 1,
      offset: 1,
    },
    tags: [],
  }
  expect(GetHoverFromTsResult.getHoverFromTsResult(tsResult)).toEqual({
    displayString: 'abc',
    documentation: 'def',
    languageId: 'typescript',
  })
})

test('getHoverFromTsResult - null', () => {
  const tsResult = null as any
  expect(GetHoverFromTsResult.getHoverFromTsResult(tsResult)).toBeUndefined()
})
