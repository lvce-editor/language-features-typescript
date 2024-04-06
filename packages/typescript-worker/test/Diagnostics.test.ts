import * as Diagnostics from '../src/parts/Diagnostics/Diagnostics.ts'
import { test, expect } from '@jest/globals'

test.skip('diagnostics', async () => {
  const textDocument = {
    uri: '',
  }
  expect(await Diagnostics.getDiagnostics(textDocument)).toEqual([
    {
      columnIndex: 0,
      message: 'test error 1',
      rowIndex: 0,
      uri: '',
    },
  ])
})
