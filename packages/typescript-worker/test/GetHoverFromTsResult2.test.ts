import type ts from 'typescript'
import { expect, test } from '@jest/globals'
import * as GetHoverFromTsResult2 from '../src/parts/GetHoverFromTsResult2/GetHoverFromTsResult2.ts'

test('getHoverFromTsResult2 - converts display parts to strings', () => {
  const tsResult = {
    displayParts: [
      { kind: 'text', text: 'const foo' },
      { kind: 'punctuation', text: ':' },
      { kind: 'space', text: ' ' },
      { kind: 'keyword', text: 'string' },
    ],
    documentation: [
      { kind: 'text', text: 'A documented ' },
      { kind: 'parameterName', text: 'value' },
    ],
  } as ts.QuickInfo

  expect(GetHoverFromTsResult2.getHoverFromTsResult2(tsResult)).toEqual({
    displayString: 'const foo: string',
    documentation: 'A documented value',
    languageId: 'typescript',
  })
})

test('getHoverFromTsResult2 - empty documentation', () => {
  const tsResult = {
    displayParts: [],
    documentation: [],
  } as unknown as ts.QuickInfo

  expect(GetHoverFromTsResult2.getHoverFromTsResult2(tsResult)).toEqual({
    displayString: '',
    documentation: '',
    languageId: 'typescript',
  })
})

test('getHoverFromTsResult2 - undefined', () => {
  expect(GetHoverFromTsResult2.getHoverFromTsResult2(undefined)).toBeUndefined()
})
