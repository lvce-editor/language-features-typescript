import { expect, test } from '@jest/globals'
import * as ConvertTsCompletionEntry from '../src/parts/ConvertTsCompletionEntry/ConvertTsCompletionEntry.ts'
import type * as Protocol from '../src/parts/TypeScriptProtocol/TypeScriptProtocol.ts'

test('convertTsCompletionEntry', () => {
  const tsResult: Protocol.CompletionEntry = {
    kind: 'keyword' as Protocol.CompletionEntry['kind'],
    name: 'abc',
    sortText: 'abc',
    kindModifiers: '',
  }
  expect(ConvertTsCompletionEntry.convertTsCompletionEntry(tsResult)).toEqual({
    data: undefined,
    flags: 0,
    kind: 5,
    label: 'abc',
    snippet: 'abc',
    source: undefined,
  })
})
