import { expect, test } from '@jest/globals'
import type { CompletionInfo } from 'typescript'
import * as GetCompletionFromTsResult from '../src/parts/GetCompletionFromTsResult/GetCompletionFromTsResult.ts'

test('getCompletionFromTsResult', () => {
  const tsResult: CompletionInfo = {
    entries: [],
    isGlobalCompletion: true,
    isMemberCompletion: false,
    isNewIdentifierLocation: false,
  }
  expect(GetCompletionFromTsResult.getCompletionFromTsResult(tsResult)).toEqual([])
})
