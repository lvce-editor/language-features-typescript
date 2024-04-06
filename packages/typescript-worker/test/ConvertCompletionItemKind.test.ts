import { expect, test } from '@jest/globals'
import * as CompletionKind from '../src/parts/CompletionKind/CompletionKind.ts'
import * as ConvertCompletionItemKind from '../src/parts/ConvertCompletionItemKind/ConvertCompletionItemKind.ts'
import * as TsCompletionItemKind from '../src/parts/TsCompletionItemKind/TsCompletionItemKind.ts'

test('convertCompletionItemKind', () => {
  expect(ConvertCompletionItemKind.convertCompletionItemKind(TsCompletionItemKind.Function)).toBe(
    CompletionKind.Function,
  )
  expect(ConvertCompletionItemKind.convertCompletionItemKind(TsCompletionItemKind.Method)).toBe(CompletionKind.Function)
  expect(ConvertCompletionItemKind.convertCompletionItemKind(TsCompletionItemKind.LocalFunction)).toBe(
    CompletionKind.Function,
  )
})
