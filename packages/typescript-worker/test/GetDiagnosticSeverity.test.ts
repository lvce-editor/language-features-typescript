import { expect, test } from '@jest/globals'
import * as GetDiagnosticSeverity from '../src/parts/GetDiagnosticSeverity/GetDiagnosticSeverity.ts'

test('warning', () => {
  const diagnostic = {
    category: 'error',
    code: 6196,
  }
  expect(GetDiagnosticSeverity.getDiagnosticSeverity(diagnostic)).toBe('warning')
})

test('warning with numeric category', () => {
  const diagnostic = {
    category: 1,
    code: 6133,
  }
  expect(GetDiagnosticSeverity.getDiagnosticSeverity(diagnostic)).toBe('warning')
})

test('error', () => {
  const diagnostic = {
    category: 'error',
    code: 123_456,
  }
  expect(GetDiagnosticSeverity.getDiagnosticSeverity(diagnostic)).toBe('error')
})
