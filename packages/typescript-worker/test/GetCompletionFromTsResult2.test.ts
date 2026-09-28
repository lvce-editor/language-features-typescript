import type ts from 'typescript'
import { expect, test } from '@jest/globals'
import { getCompletionFromTsResult2 } from '../src/parts/GetCompletionFromTsResult2/GetCompletionFromTsResult2.ts'

test('returns no completions when TypeScript returns no result', () => {
  expect(getCompletionFromTsResult2(undefined)).toEqual([])
})

test('converts useful completion entries to worker completion items', () => {
  const result = {
    entries: [
      { name: 'value', kind: 'const', kindModifiers: '', sortText: '0' },
      { name: 'X509Certificate', kind: 'warning', kindModifiers: '', sortText: '1' },
    ],
    isGlobalCompletion: false,
    isMemberCompletion: false,
    isNewIdentifierLocation: false,
  } as ts.CompletionInfo

  expect(getCompletionFromTsResult2(result)).toEqual([
    { flags: 0, kind: 0, label: 'value', snippet: 'value', source: 'ts' },
  ])
})
