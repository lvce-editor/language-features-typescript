import type ts from 'typescript'
import { expect, test } from '@jest/globals'
import { getCompletionFromTsResult2 } from '../src/parts/GetCompletionFromTsResult2/GetCompletionFromTsResult2.ts'

test('returns no completions when TypeScript returns no result', () => {
  expect(getCompletionFromTsResult2(undefined)).toEqual([])
})

test('converts useful completion entries to worker completion items', () => {
  const result = {
    entries: [
      { kind: 'const', kindModifiers: '', name: 'value', sortText: '0' },
      { kind: 'warning', kindModifiers: '', name: 'X509Certificate', sortText: '1' },
    ],
    isGlobalCompletion: false,
    isMemberCompletion: false,
    isNewIdentifierLocation: false,
  } as ts.CompletionInfo

  expect(getCompletionFromTsResult2(result)).toEqual([
    { flags: 0, kind: 0, label: 'value', snippet: 'value', source: 'ts' },
  ])
})

test('preserves a TypeScript replacement span for the completion worker', () => {
  const result = {
    entries: [
      {
        kind: 'method',
        kindModifiers: '',
        name: 'closeAllEditors',
        replacementSpan: { length: 20, start: 5 },
        sortText: '0',
      },
    ],
    isGlobalCompletion: false,
    isMemberCompletion: true,
    isNewIdentifierLocation: false,
  } as ts.CompletionInfo

  expect(getCompletionFromTsResult2(result)).toEqual([
    {
      flags: 0,
      kind: 0,
      label: 'closeAllEditors',
      replacementRange: { endOffset: 25, startOffset: 5 },
      snippet: 'closeAllEditors',
      source: 'ts',
    },
  ])
})
