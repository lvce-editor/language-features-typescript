import { expect, test } from '@jest/globals'
import * as CompletionItemFlags from '../src/parts/CompletionItemFlags/CompletionItemFlags.ts'
import * as ConvertTsCompletionKindModifiers from '../src/parts/ConvertTsCompletionKindModifiers/ConvertTsCompletionKindModifiers.ts'

test('empty string', () => {
  expect(ConvertTsCompletionKindModifiers.convertTsCompletionKindModifiers('')).toBe(CompletionItemFlags.None)
})

test('deprecated', () => {
  expect(ConvertTsCompletionKindModifiers.convertTsCompletionKindModifiers('deprecated')).toBe(
    CompletionItemFlags.Deprecated,
  )
})
