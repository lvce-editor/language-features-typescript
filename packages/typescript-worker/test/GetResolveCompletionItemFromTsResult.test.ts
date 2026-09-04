import { expect, test } from '@jest/globals'
import type * as TypeScriptProtocol from '../src/parts/TypeScriptProtocol/TypeScriptProtocol.ts'
import * as GetResolvedCompletionItemFromTsResult from '../src/parts/GetResolvedCompletionItemFromTsResult/GetResolvedCompletionItemFromTsResult.ts'

test('getCompletion', async () => {
  const tsResult: TypeScriptProtocol.CompletionEntryDetails[] = [
    {
      displayParts: [
        {
          kind: 'keyword',
          text: 'function',
        },
        {
          kind: 'space',
          text: ' ',
        },
        {
          kind: 'text',
          text: 'add',
        },
        {
          kind: 'punctuation',
          text: '(',
        },
        {
          kind: 'parameterName',
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
          text: ',',
        },
        {
          kind: 'space',
          text: ' ',
        },
        {
          kind: 'parameterName',
          text: 'b',
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
      ],
      documentation: [],
      kind: 'function' as TypeScriptProtocol.ScriptElementKind,
      kindModifiers: 'export',
      name: 'add',
      tags: [],
    },
  ]
  expect(GetResolvedCompletionItemFromTsResult.getResolveCompletionItemFromTsResult(tsResult)).toEqual({
    name: 'add',
    snippet: 'add(a, b)',
  })
})
