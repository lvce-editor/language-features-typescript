import type ts from 'typescript'
import { expect, test } from '@jest/globals'
import { getSignatureHelpFromTsResult } from '../src/parts/GetSignatureHelpFromTsResult/GetSignatureHelpFromTsResult.ts'

test('getSignatureHelpFromTsResult converts TypeScript signature help', () => {
  const result: ts.SignatureHelpItems = {
    applicableSpan: {
      length: 4,
      start: 0,
    },
    argumentCount: 2,
    argumentIndex: 1,
    items: [
      {
        documentation: [{ kind: 'text', text: 'Calls foo.' }],
        isVariadic: false,
        parameters: [
          {
            displayParts: [{ kind: 'parameterName', text: 'first: string' }],
            documentation: [{ kind: 'text', text: 'First value.' }],
            isOptional: false,
            name: 'first',
          },
          {
            displayParts: [{ kind: 'parameterName', text: 'second: number' }],
            documentation: [{ kind: 'text', text: 'Second value.' }],
            isOptional: false,
            name: 'second',
          },
        ],
        prefixDisplayParts: [{ kind: 'text', text: 'foo(' }],
        separatorDisplayParts: [{ kind: 'text', text: ', ' }],
        suffixDisplayParts: [{ kind: 'text', text: '): void' }],
        tags: [],
      },
    ],
    selectedItemIndex: 0,
  }

  expect(getSignatureHelpFromTsResult(result)).toEqual({
    activeParameter: 1,
    activeSignature: 0,
    signatures: [
      {
        documentation: 'Calls foo.',
        label: 'foo(first: string, second: number): void',
        parameters: [
          {
            documentation: 'First value.',
            label: 'first: string',
          },
          {
            documentation: 'Second value.',
            label: 'second: number',
          },
        ],
      },
    ],
  })
})

test('getSignatureHelpFromTsResult returns undefined for no result', () => {
  expect(getSignatureHelpFromTsResult(undefined)).toBeUndefined()
})
