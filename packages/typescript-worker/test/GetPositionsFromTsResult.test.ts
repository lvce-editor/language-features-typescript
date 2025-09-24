import { expect, test } from '@jest/globals'
import type * as Protocol from '../src/parts/TypeScriptProtocol/TypeScriptProtocol.ts'
import * as GetPositionsFromTsResult from '../src/parts/GetPositionsFromTsResult/GetPositionsFromTsResult.ts'

test('getPositionsFomTsResult', () => {
  const positions = new Uint32Array([1, 7, 1, 7])
  const tsResult: readonly Protocol.SelectionRange[] = [
    {
      textSpan: {
        start: {
          line: 2,
          offset: 3,
        },
        end: {
          line: 2,
          offset: 9,
        },
      },
    },
  ]
  expect(GetPositionsFromTsResult.getPositionsFromTsResult(positions, tsResult)).toEqual([1, 2, 1, 8])
})

test('getPositionsFomTsResult - no matching selection', () => {
  const positions = new Uint32Array([1, 1, 5, 5])
  const tsResult: readonly Protocol.SelectionRange[] = [
    {
      textSpan: {
        start: {
          line: 3,
          offset: 3,
        },
        end: {
          line: 3,
          offset: 3,
        },
      },
    },
  ]
  expect(GetPositionsFromTsResult.getPositionsFromTsResult(positions, tsResult)).toEqual([])
})

test('getPositionsFomTsResult - with parent range', () => {
  const positions = new Uint32Array([1, 1, 5, 5])
  const tsResult: readonly Protocol.SelectionRange[] = [
    {
      textSpan: {
        start: {
          line: 3,
          offset: 3,
        },
        end: {
          line: 3,
          offset: 3,
        },
      },
      parent: {
        textSpan: {
          start: {
            line: 1,
            offset: 1,
          },
          end: {
            line: 5,
            offset: 5,
          },
        },
      },
    },
  ]
  expect(GetPositionsFromTsResult.getPositionsFromTsResult(positions, tsResult)).toEqual([0, 0, 4, 4])
})

test('getPositionsFomTsResult - no result', () => {
  const positions = new Uint32Array([1, 7, 1, 7])
  const tsResult = undefined as any
  expect(GetPositionsFromTsResult.getPositionsFromTsResult(positions, tsResult)).toEqual([])
})
