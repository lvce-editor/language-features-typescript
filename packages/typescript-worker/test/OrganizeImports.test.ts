import { beforeEach, expect, jest, test } from '@jest/globals'

beforeEach(() => {
  jest.resetAllMocks()
})

jest.unstable_mockModule('../src/parts/TypeScriptRpc/TypeScriptRpc.ts', () => {
  return {
    invoke: jest.fn(),
  }
})

const OrganizeImports = await import('../src/parts/OrganizeImports/OrganizeImports.ts')
const TypeScriptRpc = await import('../src/parts/TypeScriptRpc/TypeScriptRpc.ts')

test('organizeImports', async () => {
  jest.spyOn(TypeScriptRpc, 'invoke').mockImplementation(async (method) => {
    if (method === 'OrganizeImports.organizeImports') {
      return []
    }
  })
  const textDocument = {
    uri: '',
  }
  expect(await OrganizeImports.organizeImports(textDocument)).toEqual([])
})
