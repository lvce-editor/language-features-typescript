import { expect, test } from '@jest/globals'
import * as GetResolvedCompletionItemFromTsResult from '../src/parts/GetResolvedCompletionItemFromTsResult/GetResolvedCompletionItemFromTsResult.ts'
import type * as TypeScriptProtocol from '../src/parts/TypeScriptProtocol/TypeScriptProtocol.ts'

test('getCompletion', async () => {
  const tsResult: TypeScriptProtocol.CompletionEntryDetails[] = [
    {
      name: 'add',
      kindModifiers: 'export',
      kind: 'function' as TypeScriptProtocol.ScriptElementKind,
      displayParts: [
        {
          text: 'function',
          kind: 'keyword',
        },
        {
          text: ' ',
          kind: 'space',
        },
        {
          text: 'add',
          kind: 'text',
        },
        {
          text: '(',
          kind: 'punctuation',
        },
        {
          text: 'a',
          kind: 'parameterName',
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
          text: ',',
          kind: 'punctuation',
        },
        {
          text: ' ',
          kind: 'space',
        },
        {
          text: 'b',
          kind: 'parameterName',
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
      ],
      documentation: [],
      tags: [],
    },
  ]
  expect(GetResolvedCompletionItemFromTsResult.getResolveCompletionItemFromTsResult(tsResult)).toEqual({
    name: 'add',
    snippet: 'add(a, b)',
  })
})
