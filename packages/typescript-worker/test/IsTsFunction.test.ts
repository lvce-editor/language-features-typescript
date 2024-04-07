import { expect, test } from '@jest/globals'
import * as IsTsFunction from '../src/parts/IsTsFunction/IsTsFunction.ts'
import * as TsCompletionItemKind from '../src/parts/TsCompletionItemKind/TsCompletionItemKind.ts'
import type * as TypeScriptProtocol from '../src/parts/TypeScriptProtocol/TypeScriptProtocol.ts'

test('function', () => {
  const tsResult: TypeScriptProtocol.CompletionEntryDetails = {
    kind: TsCompletionItemKind.Function as TypeScriptProtocol.ScriptElementKind,
    displayParts: [],
    kindModifiers: '',
    name: '',
  }
  expect(IsTsFunction.isFunction(tsResult)).toBe(true)
})

test('local function', () => {
  const tsResult: TypeScriptProtocol.CompletionEntryDetails = {
    kind: TsCompletionItemKind.LocalFunction as TypeScriptProtocol.ScriptElementKind,
    displayParts: [],
    kindModifiers: '',
    name: '',
  }
  expect(IsTsFunction.isFunction(tsResult)).toBe(true)
})

test('method', () => {
  const tsResult: TypeScriptProtocol.CompletionEntryDetails = {
    kind: TsCompletionItemKind.Method as TypeScriptProtocol.ScriptElementKind,
    displayParts: [],
    kindModifiers: '',
    name: '',
  }
  expect(IsTsFunction.isFunction(tsResult)).toBe(true)
})

test('other', () => {
  const tsResult: TypeScriptProtocol.CompletionEntryDetails = {
    kind: TsCompletionItemKind.Const as TypeScriptProtocol.ScriptElementKind,
    displayParts: [],
    kindModifiers: '',
    name: '',
  }
  expect(IsTsFunction.isFunction(tsResult)).toBe(false)
})
