import { test, expect } from '@jest/globals'
import { getPositionAt } from '../src/parts/GetPositionAt/GetPositionAt.ts'

test('getPositionAt - single line', () => {
  const text = 'hello world'
  expect(getPositionAt(text, 0)).toEqual({ rowIndex: 0, columnIndex: 0 })
  expect(getPositionAt(text, 5)).toEqual({ rowIndex: 0, columnIndex: 5 })
  expect(getPositionAt(text, 11)).toEqual({ rowIndex: 0, columnIndex: 11 })
})

test('getPositionAt - multiple lines', () => {
  const text = 'line1\nline2\nline3'
  expect(getPositionAt(text, 0)).toEqual({ rowIndex: 0, columnIndex: 0 })
  expect(getPositionAt(text, 5)).toEqual({ rowIndex: 0, columnIndex: 5 })
  expect(getPositionAt(text, 6)).toEqual({ rowIndex: 1, columnIndex: 0 })
  expect(getPositionAt(text, 11)).toEqual({ rowIndex: 1, columnIndex: 5 })
  expect(getPositionAt(text, 12)).toEqual({ rowIndex: 2, columnIndex: 0 })
  expect(getPositionAt(text, 17)).toEqual({ rowIndex: 2, columnIndex: 5 })
})

test('getPositionAt - empty lines', () => {
  const text = 'line1\n\nline3'
  expect(getPositionAt(text, 0)).toEqual({ rowIndex: 0, columnIndex: 0 })
  expect(getPositionAt(text, 5)).toEqual({ rowIndex: 0, columnIndex: 5 })
  expect(getPositionAt(text, 6)).toEqual({ rowIndex: 1, columnIndex: 0 })
  expect(getPositionAt(text, 7)).toEqual({ rowIndex: 2, columnIndex: 0 })
  expect(getPositionAt(text, 12)).toEqual({ rowIndex: 2, columnIndex: 5 })
})

test('getPositionAt - empty string', () => {
  const text = ''
  expect(getPositionAt(text, 0)).toEqual({ rowIndex: 0, columnIndex: 0 })
})

test('getPositionAt - single character lines', () => {
  const text = 'a\nb\nc'
  expect(getPositionAt(text, 0)).toEqual({ rowIndex: 0, columnIndex: 0 })
  expect(getPositionAt(text, 1)).toEqual({ rowIndex: 0, columnIndex: 1 })
  expect(getPositionAt(text, 2)).toEqual({ rowIndex: 1, columnIndex: 0 })
  expect(getPositionAt(text, 3)).toEqual({ rowIndex: 1, columnIndex: 1 })
  expect(getPositionAt(text, 4)).toEqual({ rowIndex: 2, columnIndex: 0 })
  expect(getPositionAt(text, 5)).toEqual({ rowIndex: 2, columnIndex: 1 })
})

test('getPositionAt - offset beyond text length', () => {
  const text = 'line1\nline2'
  expect(getPositionAt(text, 20)).toEqual({ rowIndex: 1, columnIndex: 5 })
})
