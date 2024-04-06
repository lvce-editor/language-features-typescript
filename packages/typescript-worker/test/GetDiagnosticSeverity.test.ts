import { expect, test } from '@jest/globals'
import * as GetDiagnosticSeverity from '../src/parts/GetDiagnosticSeverity/GetDiagnosticSeverity.ts'

test('warning', () => {
  const diagnostic = {
    code: 6196,
    category: 'error',
  }
  expect(GetDiagnosticSeverity.getDiagnosticSeverity(diagnostic)).toBe('warning')
})

test('error', () => {
  const diagnostic = {
    code: 123456,
    category: 'error',
  }
  expect(GetDiagnosticSeverity.getDiagnosticSeverity(diagnostic)).toBe('error')
})
