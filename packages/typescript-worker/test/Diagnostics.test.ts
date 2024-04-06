import { expect, jest, test } from '@jest/globals'

import { beforeEach } from '@jest/globals'

beforeEach(() => {
  jest.resetAllMocks()
})

jest.unstable_mockModule('../src/parts/TypeScriptRpc/TypeScriptRpc.ts', () => {
  return {
    invoke: jest.fn(),
  }
})

const Diagnostics = await import('../src/parts/Diagnostics/Diagnostics.ts')
const TypeScriptRpc = await import('../src/parts/TypeScriptRpc/TypeScriptRpc.ts')

test('diagnostics', async () => {
  jest.spyOn(TypeScriptRpc, 'invoke').mockImplementation(async (method) => {
    if (method === 'Diagnostic.getDiagnostics') {
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
      ]
    }
  })
  const textDocument = {
    uri: '',
  }
  expect(await Diagnostics.getDiagnostics(textDocument)).toEqual([
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
