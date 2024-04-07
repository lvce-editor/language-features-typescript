import { beforeEach, expect, jest, test } from '@jest/globals'

beforeEach(() => {
  jest.resetAllMocks()
})

jest.unstable_mockModule('../src/parts/TypeScriptRpc/TypeScriptRpc.ts', () => {
  return {
    invoke: jest.fn(),
  }
})

const FileReferences = await import('../src/parts/FileReferences/FileReferences.ts')
const TypeScriptRpc = await import('../src/parts/TypeScriptRpc/TypeScriptRpc.ts')

test('getFileReferences', async () => {
  jest.spyOn(TypeScriptRpc, 'invoke').mockImplementation(async (method) => {
    if (method === 'References.getFileReferences') {
      return [
        {
          refs: [],
        },
      ]
    }
  })
  const textDocument = {
    uri: '',
  }
  expect(await FileReferences.getFileReferences(textDocument)).toEqual([])
})
