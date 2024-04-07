import { expect, test } from '@jest/globals'
import * as GetCompletionFromTsResult from '../src/parts/GetCompletionFromTsResult/GetCompletionFromTsResult.ts'
import * as TypeScriptProtocol from '../src/parts/TypeScriptProtocol/TypeScriptProtocol.ts'

test('getCompletionFromTsResult', () => {
  const tsResult: TypeScriptProtocol.CompletionInfoResponse['body'] = {
    entries: [],
    isGlobalCompletion: true,
    isMemberCompletion: false,
    isNewIdentifierLocation: false,
  }
  expect(GetCompletionFromTsResult.getCompletionFromTsResult(tsResult)).toEqual([])
})
