import { expect, test } from '@jest/globals'
import type * as TypeScriptProtocol from '../src/parts/TypeScriptProtocol/TypeScriptProtocol.ts'
import * as GetParameterListParts from '../src/parts/GetParameterListParts/GetParameterListParts.ts'

test('getParameterListParts', () => {
  const displayParts: TypeScriptProtocol.SymbolDisplayPart[] = [
    {
      kind: 'methodName',
      text: 'a',
    },
  ]
  expect(GetParameterListParts.getParameterListParts(displayParts)).toEqual([])
})

test('getParameterListParts - object', () => {
  const displayParts: TypeScriptProtocol.SymbolDisplayPart[] = [
    {
      kind: 'keyword',
      text: 'function',
    },
    {
      kind: 'space',
      text: ' ',
    },
    {
      kind: 'functionName',
      text: 'complex',
    },
    {
      kind: 'punctuation',
      text: '(',
    },
    {
      kind: 'punctuation',
      text: '{',
    },
    {
      kind: 'space',
      text: ' ',
    },
    {
      kind: 'parameterName',
      text: 'a',
    },
    {
      kind: 'space',
      text: ' ',
    },
    {
      kind: 'punctuation',
      text: '}',
    },
    {
      kind: 'punctuation',
      text: ':',
    },
    {
      kind: 'space',
      text: ' ',
    },
    {
      kind: 'punctuation',
      text: '{',
    },
    {
      kind: 'lineBreak',
      text: '\n',
    },
    {
      kind: 'space',
      text: ' '.repeat(4),
    },
    {
      kind: 'propertyName',
      text: 'a',
    },
    {
      kind: 'punctuation',
      text: ':',
    },
    {
      kind: 'space',
      text: ' ',
    },
    {
      kind: 'keyword',
      text: 'number',
    },
    {
      kind: 'punctuation',
      text: ';',
    },
    {
      kind: 'lineBreak',
      text: '\n',
    },
    {
      kind: 'punctuation',
      text: '}',
    },
    {
      kind: 'punctuation',
      text: ')',
    },
    {
      kind: 'punctuation',
      text: ':',
    },
    {
      kind: 'space',
      text: ' ',
    },
    {
      kind: 'keyword',
      text: 'void',
    },
  ]
  expect(GetParameterListParts.getParameterListParts(displayParts)).toEqual([])
})

test('getParameterListParts - rest parameters', () => {
  const displayParts: TypeScriptProtocol.SymbolDisplayPart[] = [
    {
      kind: 'keyword',
      text: 'function',
    },
    {
      kind: 'space',
      text: ' ',
    },
    {
      kind: 'functionName',
      text: 'complex',
    },
    {
      kind: 'punctuation',
      text: '(',
    },
    {
      kind: 'punctuation',
      text: '...',
    },
    {
      kind: 'parameterName',
      text: 'items',
    },
    {
      kind: 'punctuation',
      text: ':',
    },
    {
      kind: 'space',
      text: ' ',
    },
    {
      kind: 'keyword',
      text: 'any',
    },
    {
      kind: 'punctuation',
      text: '[',
    },
    {
      kind: 'punctuation',
      text: ']',
    },
    {
      kind: 'punctuation',
      text: ')',
    },
    {
      kind: 'punctuation',
      text: ':',
    },
    {
      kind: 'space',
      text: ' ',
    },
    {
      kind: 'keyword',
      text: 'void',
    },
  ]
  expect(GetParameterListParts.getParameterListParts(displayParts)).toEqual([])
})
