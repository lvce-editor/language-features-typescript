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
jest.unstable_mockModule('../src/parts/GetOrCreateLanguageService/GetOrCreateLanguageService.ts', () => {
  return {
    getOrCreateLanguageService: jest.fn(),
  }
})

const References = await import('../src/parts/References/References.ts')
const TypeScriptRpc = await import('../src/parts/TypeScriptRpc/TypeScriptRpc.ts')
const Rpc = await import('../src/parts/Rpc/Rpc.ts')
const GetOrCreateLanguageService = await import('../src/parts/GetOrCreateLanguageService/GetOrCreateLanguageService.ts')

test('provideReferences', async () => {
  const writeFile = jest.fn()
  const getReferencesAtPosition = jest.fn((_uri: string, _offset: number) => [
    {
      fileName: 'file:///test.ts',
      textSpan: {
        length: 5,
        start: 6,
      },
    },
  ])
  jest.spyOn(GetOrCreateLanguageService, 'getOrCreateLanguageService').mockReturnValue({
    fs: {
      readFile: jest.fn(() => 'const value = 1'),
      writeFile,
    },
    languageService: {
      getReferencesAtPosition,
    },
  } as any)
  const textDocument = {
    text: 'const value = 1',
    uri: 'file:///test.ts',
  }
  const offset = 7
  expect(await References.provideReferences(textDocument, offset)).toEqual([
    {
      endColumnIndex: 11,
      endRowIndex: 0,
      startColumnIndex: 6,
      startRowIndex: 0,
      uri: 'file:///test.ts',
    },
  ])
  expect(writeFile).toHaveBeenCalledWith(textDocument.uri, textDocument.text)
  expect(getReferencesAtPosition).toHaveBeenCalledWith(textDocument.uri, offset)
  expect(TypeScriptRpc.invoke).not.toHaveBeenCalled()
})

test('provideFileReferences', async () => {
  jest.spyOn(TypeScriptRpc, 'invoke').mockImplementation(async (method) => {
    if (method === 'References.getFileReferences') {
      return {
        refs: [],
      }
    }
  })
  jest.spyOn(Rpc, 'invoke').mockImplementation(async (method) => {
    if (method === 'Position.getPosition') {
      return {
        columnIndex: 0,
        rowIndex: 0,
      }
    }
  })
  const textDocument = {
    uri: '',
  }
  expect(await References.provideFileReferences(textDocument)).toEqual([])
})
