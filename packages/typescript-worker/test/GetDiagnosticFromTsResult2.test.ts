import type ts from 'typescript'
import { expect, test } from '@jest/globals'
import { getDiagnosticsFromTsResult2 } from '../src/parts/GetDiagnosticFromTsResult2/GetDiagnosticFromTsResult2.ts'

test('skips diagnostics without a source location', () => {
  const diagnostics = [
    {
      category: 1,
      code: 2318,
      file: undefined,
      length: undefined,
      messageText: "Cannot find global type 'Array'.",
      start: undefined,
    },
  ] as const

  expect(getDiagnosticsFromTsResult2('const value = 1', diagnostics)).toEqual([])
})

test('converts diagnostics with a source location', () => {
  const diagnostics = [
    {
      category: 1,
      code: 2322,
      file: {
        fileName: '/test.ts',
      } as ts.SourceFile,
      length: 5,
      messageText: "Type 'number' is not assignable to type 'string'.",
      start: 6,
    },
  ] as const

  expect(getDiagnosticsFromTsResult2('const value = 1', diagnostics)).toEqual([
    {
      code: 2322,
      columnIndex: 6,
      endColumnIndex: 11,
      endRowIndex: 0,
      message: "Type 'number' is not assignable to type 'string'.",
      rowIndex: 0,
      source: 'ts',
      type: 'error',
      uri: '/test.ts',
    },
  ])
})

test('flattens diagnostic message chains', () => {
  const diagnostics = [
    {
      category: 1,
      code: 7053,
      file: {
        fileName: '/test.ts',
      } as ts.SourceFile,
      length: 5,
      messageText: {
        category: 1,
        code: 7053,
        messageText:
          "Element implicitly has an 'any' type because expression of type 'number' can't be used to index type 'State'.",
        next: [
          {
            category: 1,
            code: 7053,
            messageText: "No index signature with a parameter of type 'number' was found on type 'State'.",
          },
        ],
      },
      start: 6,
    },
  ] as const

  expect(getDiagnosticsFromTsResult2('const value = 1', diagnostics)).toEqual([
    {
      code: 7053,
      columnIndex: 6,
      endColumnIndex: 11,
      endRowIndex: 0,
      message:
        "Element implicitly has an 'any' type because expression of type 'number' can't be used to index type 'State'.\n  No index signature with a parameter of type 'number' was found on type 'State'.",
      rowIndex: 0,
      source: 'ts',
      type: 'error',
      uri: '/test.ts',
    },
  ])
})
