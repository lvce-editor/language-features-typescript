import { expect, test } from '@jest/globals'
import type { CommonRpc } from '../src/parts/CommonRpc/CommonRpc.ts'
import * as Diagnostics from '../src/parts/Diagnostics/Diagnostics.ts'

test('diagnostics', async () => {
  const typescriptRpc: CommonRpc = {
    invoke() {
      return [
        {
          category: 'error',
          end: {
            line: 1,
            offset: 1,
          },
          start: {
            line: 1,
            offset: 1,
          },
          text: 'test text',
        },
      ] as any
    },
  }

  const textDocument = {
    uri: '',
  }
  const Position = {}
  expect(await Diagnostics.getDiagnostics(typescriptRpc, Position, textDocument)).toEqual([
    {
      code: undefined,
      columnIndex: 0,
      endColumnIndex: 0,
      endRowIndex: 0,
      message: 'test text',
      rowIndex: 0,
      source: 'ts',
      type: 'error',
      uri: '',
    },
  ])
})
