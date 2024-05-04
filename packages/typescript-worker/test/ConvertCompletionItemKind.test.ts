import { expect, test } from '@jest/globals'
import * as CompletionKind from '../src/parts/CompletionKind/CompletionKind.ts'
import * as ConvertCompletionItemKind from '../src/parts/ConvertCompletionItemKind/ConvertCompletionItemKind.ts'
import * as TsCompletionItemKind from '../src/parts/TsCompletionItemKind/TsCompletionItemKind.ts'

test('function', () => {
  expect(ConvertCompletionItemKind.convertCompletionItemKind(TsCompletionItemKind.Function)).toBe(
    CompletionKind.Function,
  )
  expect(ConvertCompletionItemKind.convertCompletionItemKind(TsCompletionItemKind.Method)).toBe(CompletionKind.Function)
  expect(ConvertCompletionItemKind.convertCompletionItemKind(TsCompletionItemKind.LocalFunction)).toBe(
    CompletionKind.Function,
  )
})

test('variable', () => {
  expect(ConvertCompletionItemKind.convertCompletionItemKind(TsCompletionItemKind.Var)).toBe(CompletionKind.Variable)
  expect(ConvertCompletionItemKind.convertCompletionItemKind(TsCompletionItemKind.Const)).toBe(CompletionKind.Variable)
  expect(ConvertCompletionItemKind.convertCompletionItemKind(TsCompletionItemKind.Let)).toBe(CompletionKind.Variable)
  expect(ConvertCompletionItemKind.convertCompletionItemKind(TsCompletionItemKind.LocalVariable)).toBe(
    CompletionKind.Variable,
  )
  expect(ConvertCompletionItemKind.convertCompletionItemKind(TsCompletionItemKind.Alias)).toBe(CompletionKind.Variable)
  expect(ConvertCompletionItemKind.convertCompletionItemKind(TsCompletionItemKind.Parameter)).toBe(
    CompletionKind.Variable,
  )
})

test('keyword', () => {
  expect(ConvertCompletionItemKind.convertCompletionItemKind(TsCompletionItemKind.PrimitiveType)).toBe(
    CompletionKind.Keyword,
  )
  expect(ConvertCompletionItemKind.convertCompletionItemKind(TsCompletionItemKind.Keyword)).toBe(CompletionKind.Keyword)
})

test('folder', () => {
  expect(ConvertCompletionItemKind.convertCompletionItemKind(TsCompletionItemKind.Directory)).toBe(
    CompletionKind.Folder,
  )
})

test('file', () => {
  expect(ConvertCompletionItemKind.convertCompletionItemKind(TsCompletionItemKind.Script)).toBe(CompletionKind.File)
})

test('field', () => {
  expect(ConvertCompletionItemKind.convertCompletionItemKind(TsCompletionItemKind.Property)).toBe(CompletionKind.Field)
  expect(ConvertCompletionItemKind.convertCompletionItemKind(TsCompletionItemKind.MemberVariable)).toBe(
    CompletionKind.Field,
  )
  expect(ConvertCompletionItemKind.convertCompletionItemKind(TsCompletionItemKind.MemberGetAccessor)).toBe(
    CompletionKind.Field,
  )
  expect(ConvertCompletionItemKind.convertCompletionItemKind(TsCompletionItemKind.MemberSetAccessor)).toBe(
    CompletionKind.Field,
  )
})

test('unknown', () => {
  expect(ConvertCompletionItemKind.convertCompletionItemKind('-1')).toBe(CompletionKind.Unknown)
})
