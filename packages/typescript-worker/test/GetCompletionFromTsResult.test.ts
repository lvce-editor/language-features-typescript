import * as Diagnostics from '../src/parts/Diagnostics/Diagnostics.ts'
import * as GetCompletionFromTsResult from '../src/parts/GetCompletionFromTsResult/GetCompletionFromTsResult.ts'
import { test, expect } from '@jest/globals'
import type { CompletionInfo } from 'typescript'

test('getCompletionFromTsResult', () => {
  const tsResult: CompletionInfo = {
    entries: [],
    isGlobalCompletion: true,
    isMemberCompletion: false,
    isNewIdentifierLocation: false,
  }
  expect(GetCompletionFromTsResult.getCompletionFromTsResult(tsResult)).toEqual([])
})
