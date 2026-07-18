import type ts from 'typescript'
import { expect, test } from '@jest/globals'
import { isDiagnosticAtOffset } from '../src/parts/IsDiagnosticAtOffset/IsDiagnosticAtOffset.ts'

const diagnostic = {
  category: 1 as ts.DiagnosticCategory,
  code: 2551,
  file: undefined,
  length: 5,
  messageText: 'Unknown property',
  start: 23,
} satisfies ts.Diagnostic

test('isDiagnosticAtOffset returns true for an offset inside the diagnostic', () => {
  expect(isDiagnosticAtOffset(diagnostic, 25)).toBe(true)
})

test('isDiagnosticAtOffset returns false for an offset outside the diagnostic', () => {
  expect(isDiagnosticAtOffset(diagnostic, 22)).toBe(false)
})

test('isDiagnosticAtOffset returns false for a diagnostic without a location', () => {
  expect(
    isDiagnosticAtOffset(
      {
        ...diagnostic,
        length: undefined,
        start: undefined,
      },
      25,
    ),
  ).toBe(false)
})
