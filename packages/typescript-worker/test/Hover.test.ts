import { beforeEach, expect, jest, test } from '@jest/globals'

beforeEach(() => {
  jest.resetAllMocks()
})

jest.unstable_mockModule('../src/parts/TypeScriptRpc/TypeScriptRpc.ts', () => {
  return {
    invoke: jest.fn(),
  }
})

jest.unstable_mockModule('../src/parts/Rpc/Rpc.ts', () => {
  return {
    invoke: jest.fn(),
  }
})

const Hover = await import('../src/parts/Hover/Hover.ts')
const TypeScriptRpc = await import('../src/parts/TypeScriptRpc/TypeScriptRpc.ts')
const Rpc = await import('../src/parts/Rpc/Rpc.ts')

test('getHover', async () => {
  jest.spyOn(Rpc, 'invoke').mockResolvedValue({
    rowIndex: 0,
    columnIndex: 0,
  })
  jest.spyOn(TypeScriptRpc, 'invoke').mockImplementation(async (method) => {
    if (method === 'Hover.getHover') {
      return {}
    }
  })
  const textDocument = {
    uri: '',
  }
  const offset = 0
  expect(await Hover.getHover(textDocument, offset)).toEqual({
    displayString: undefined,
    documentation: undefined,
    languageId: 'typescript',
  })
})
