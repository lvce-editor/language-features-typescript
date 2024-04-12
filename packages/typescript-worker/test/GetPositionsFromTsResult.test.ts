import { expect, test } from '@jest/globals'
import * as GetPositionsFromTsResult from '../src/parts/GetPositionsFromTsResult/GetPositionsFromTsResult.ts'
import type * as Protocol from '../src/parts/TypeScriptProtocol/TypeScriptProtocol.ts'

test('getPositionsFomTsResult', () => {
  const positions = new Uint32Array([1, 7, 1, 7])

  const tsResult: Protocol.SelectionRange = {
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
    parent: {
      textSpan: {
        start: {
          line: 2,
          offset: 3,
        },
        end: {
          line: 2,
          offset: 16,
        },
      },
      parent: {
        textSpan: {
          start: {
            line: 1,
            offset: 40,
          },
          end: {
            line: 3,
            offset: 1,
          },
        },
        parent: {
          textSpan: {
            start: {
              line: 1,
              offset: 39,
            },
            end: {
              line: 3,
              offset: 2,
            },
          },
          parent: {
            textSpan: {
              start: {
                line: 1,
                offset: 13,
              },
              end: {
                line: 3,
                offset: 2,
              },
            },
            parent: {
              textSpan: {
                start: {
                  line: 1,
                  offset: 1,
                },
                end: {
                  line: 3,
                  offset: 2,
                },
              },
              parent: {
                textSpan: {
                  start: {
                    line: 1,
                    offset: 1,
                  },
                  end: {
                    line: 6,
                    offset: 3,
                  },
                },
              },
            },
          },
        },
      },
    },
  }
  expect(GetPositionsFromTsResult.getPositionsFromTsResult(positions, tsResult)).toEqual({
    data: undefined,
    flags: 0,
    kind: 5,
    label: 'abc',
    snippet: 'abc',
    source: undefined,
  })
})
