import { test, expect } from '@jest/globals'
import { getOffset } from '../src/parts/GetOffset/GetOffset.ts'

test('getOffset - single line', () => {
  const text = 'hello world'
  expect(getOffset(text, 0, 0)).toBe(0)
  expect(getOffset(text, 0, 5)).toBe(5)
  expect(getOffset(text, 0, 11)).toBe(11)
})

test('getOffset - multiple lines', () => {
  const text = 'line1\nline2\nline3'
  expect(getOffset(text, 0, 0)).toBe(0)
  expect(getOffset(text, 0, 5)).toBe(5)
  expect(getOffset(text, 1, 0)).toBe(6)
  expect(getOffset(text, 1, 5)).toBe(11)
  expect(getOffset(text, 2, 0)).toBe(12)
  expect(getOffset(text, 2, 5)).toBe(17)
})

test('getOffset - empty lines', () => {
  const text = 'line1\n\nline3'
  expect(getOffset(text, 0, 0)).toBe(0)
  expect(getOffset(text, 0, 5)).toBe(5)
  expect(getOffset(text, 1, 0)).toBe(6)
  expect(getOffset(text, 2, 0)).toBe(7)
  expect(getOffset(text, 2, 5)).toBe(12)
})

test('getOffset - empty string', () => {
  const text = ''
  expect(getOffset(text, 0, 0)).toBe(0)
})

test('getOffset - single character lines', () => {
  const text = 'a\nb\nc'
  expect(getOffset(text, 0, 0)).toBe(0)
  expect(getOffset(text, 0, 1)).toBe(1)
  expect(getOffset(text, 1, 0)).toBe(2)
  expect(getOffset(text, 1, 1)).toBe(3)
  expect(getOffset(text, 2, 0)).toBe(4)
  expect(getOffset(text, 2, 1)).toBe(5)
})
