import { expect, test } from '@jest/globals'
import * as GetParameterListParts from '../src/parts/GetParameterListParts/GetParameterListParts.ts'
import type * as TypeScriptProtocol from '../src/parts/TypeScriptProtocol/TypeScriptProtocol.ts'

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
      text: 'function',
      kind: 'keyword',
    },
    {
      text: ' ',
      kind: 'space',
    },
    {
      text: 'complex',
      kind: 'functionName',
    },
    {
      text: '(',
      kind: 'punctuation',
    },
    {
      text: '{',
      kind: 'punctuation',
    },
    {
      text: ' ',
      kind: 'space',
    },
    {
      text: 'a',
      kind: 'parameterName',
    },
    {
      text: ' ',
      kind: 'space',
    },
    {
      text: '}',
      kind: 'punctuation',
    },
    {
      text: ':',
      kind: 'punctuation',
    },
    {
      text: ' ',
      kind: 'space',
    },
    {
      text: '{',
      kind: 'punctuation',
    },
    {
      text: '\n',
      kind: 'lineBreak',
    },
    {
      text: '    ',
      kind: 'space',
    },
    {
      text: 'a',
      kind: 'propertyName',
    },
    {
      text: ':',
      kind: 'punctuation',
    },
    {
      text: ' ',
      kind: 'space',
    },
    {
      text: 'number',
      kind: 'keyword',
    },
    {
      text: ';',
      kind: 'punctuation',
    },
    {
      text: '\n',
      kind: 'lineBreak',
    },
    {
      text: '}',
      kind: 'punctuation',
    },
    {
      text: ')',
      kind: 'punctuation',
    },
    {
      text: ':',
      kind: 'punctuation',
    },
    {
      text: ' ',
      kind: 'space',
    },
    {
      text: 'void',
      kind: 'keyword',
    },
  ]
  expect(GetParameterListParts.getParameterListParts(displayParts)).toEqual([])
})
