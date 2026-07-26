import { test, expect } from '@jest/globals'
import { getPositionAt } from '../src/parts/GetPositionAt/GetPositionAt.ts'

test('getPositionAt - single line', () => {
  const text = 'hello world'
  expect(getPositionAt(text, 0)).toEqual({ columnIndex: 0, rowIndex: 0 })
  expect(getPositionAt(text, 5)).toEqual({ columnIndex: 5, rowIndex: 0 })
  expect(getPositionAt(text, 11)).toEqual({ columnIndex: 11, rowIndex: 0 })
})

test('getPositionAt - multiple lines', () => {
  const text = 'line1\nline2\nline3'
  expect(getPositionAt(text, 0)).toEqual({ columnIndex: 0, rowIndex: 0 })
  expect(getPositionAt(text, 5)).toEqual({ columnIndex: 5, rowIndex: 0 })
  expect(getPositionAt(text, 6)).toEqual({ columnIndex: 0, rowIndex: 1 })
  expect(getPositionAt(text, 11)).toEqual({ columnIndex: 5, rowIndex: 1 })
  expect(getPositionAt(text, 12)).toEqual({ columnIndex: 0, rowIndex: 2 })
  expect(getPositionAt(text, 17)).toEqual({ columnIndex: 5, rowIndex: 2 })
})

test('getPositionAt - empty lines', () => {
  const text = 'line1\n\nline3'
  expect(getPositionAt(text, 0)).toEqual({ columnIndex: 0, rowIndex: 0 })
  expect(getPositionAt(text, 5)).toEqual({ columnIndex: 5, rowIndex: 0 })
  expect(getPositionAt(text, 6)).toEqual({ columnIndex: 0, rowIndex: 1 })
  expect(getPositionAt(text, 7)).toEqual({ columnIndex: 0, rowIndex: 2 })
  expect(getPositionAt(text, 12)).toEqual({ columnIndex: 5, rowIndex: 2 })
})

test('getPositionAt - empty string', () => {
  const text = ''
  expect(getPositionAt(text, 0)).toEqual({ columnIndex: 0, rowIndex: 0 })
})

test('getPositionAt - single character lines', () => {
  const text = 'a\nb\nc'
  expect(getPositionAt(text, 0)).toEqual({ columnIndex: 0, rowIndex: 0 })
  expect(getPositionAt(text, 1)).toEqual({ columnIndex: 1, rowIndex: 0 })
  expect(getPositionAt(text, 2)).toEqual({ columnIndex: 0, rowIndex: 1 })
  expect(getPositionAt(text, 3)).toEqual({ columnIndex: 1, rowIndex: 1 })
  expect(getPositionAt(text, 4)).toEqual({ columnIndex: 0, rowIndex: 2 })
  expect(getPositionAt(text, 5)).toEqual({ columnIndex: 1, rowIndex: 2 })
})

test('getPositionAt - offset beyond text length', () => {
  const text = 'line1\nline2'
  expect(getPositionAt(text, 20)).toEqual({ columnIndex: 5, rowIndex: 1 })
})
