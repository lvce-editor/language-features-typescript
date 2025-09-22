import { expect, test } from '@jest/globals'
import type * as TypeScriptProtocol from '../src/parts/TypeScriptProtocol/TypeScriptProtocol.ts'
import * as GetCompletionFromTsResult from '../src/parts/GetCompletionFromTsResult/GetCompletionFromTsResult.ts'

test('getCompletionFromTsResult', () => {
  const tsResult: TypeScriptProtocol.CompletionInfoResponse['body'] = {
    entries: [],
    isGlobalCompletion: true,
    isMemberCompletion: false,
    isNewIdentifierLocation: false,
  }
  expect(GetCompletionFromTsResult.getCompletionFromTsResult(tsResult)).toEqual([])
})

test('getCompletionFromTsResult - empty', () => {
  const tsResult = undefined
  expect(GetCompletionFromTsResult.getCompletionFromTsResult(tsResult)).toEqual([])
})
