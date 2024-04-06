import * as Diagnostics from '../src/parts/Diagnostics/Diagnostics.ts'
import { test, expect } from '@jest/globals'

test('diagnostics', () => {
  const textDocument = {
    uri: '',
  }
  expect(Diagnostics.getDiagnostics(textDocument)).toEqual([
    {
      columnIndex: 0,
      message: 'test error 1',
      rowIndex: 0,
      uri: '',
    },
  ])
})
