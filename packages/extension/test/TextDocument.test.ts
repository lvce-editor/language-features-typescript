import { expect, test } from '@jest/globals'
import { getOffset, getPosition } from '../src/parts/TextDocument/TextDocument.ts'

const textDocument = {
  text: 'const value = 1\nvalue',
}

test('getOffset converts a position to an offset', () => {
  expect(getOffset(textDocument, { columnIndex: 3, rowIndex: 1 })).toBe(19)
})

test('getPosition converts an offset to a position', () => {
  expect(getPosition(textDocument, 19)).toEqual({ columnIndex: 3, rowIndex: 1 })
})
