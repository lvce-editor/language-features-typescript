import { expect, test } from '@jest/globals'
import * as GetDiagnosticFromTsResult from '../src/parts/GetDiagnosticFromTsResult/GetDiagnosticFromTsResult.ts'
import type * as TypeScriptProtocol from '../src/parts/TypeScriptProtocol/TypeScriptProtocol.ts'

test('empty string', () => {
  const textDocument = {
    uri: '/test/index.ts',
  }
  const tsResult: TypeScriptProtocol.Diagnostic[] = [
    {
      category: 'error',
      end: {
        line: 1,
        offset: 1,
      },
      start: {
        line: 1,
        offset: 1,
      },
      text: 'test text',
    },
  ]
  expect(GetDiagnosticFromTsResult.getDiagnosticsFromTsResult(textDocument, tsResult)).toEqual([
    {
      code: undefined,
      columnIndex: 0,
      endColumnIndex: 0,
      endRowIndex: 0,
      message: 'test text',
      rowIndex: 0,
      source: 'ts',
      type: 'error',
      uri: '/test/index.ts',
    },
  ])
})
