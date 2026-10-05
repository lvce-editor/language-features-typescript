import { beforeEach, expect, jest, test } from '@jest/globals'

beforeEach(() => {
  jest.resetAllMocks()
})

jest.unstable_mockModule('../src/parts/Rpc/Rpc.ts', () => ({
  invoke: jest.fn(),
}))
jest.unstable_mockModule('../src/parts/GetOrCreateLanguageService/GetOrCreateLanguageService.ts', () => ({
  getOrCreateLanguageService: jest.fn(),
}))

const Implementation = await import('../src/parts/Implementation/Implementation.ts')
const GetOrCreateLanguageService = await import('../src/parts/GetOrCreateLanguageService/GetOrCreateLanguageService.ts')

test('getImplementations', async () => {
  const writeFile = jest.fn()
  const getImplementationAtPosition = jest.fn((_fileName: string, _offset: number) => [
    {
      fileName: 'file:///implementation.ts',
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
      getImplementationAtPosition,
    },
  } as any)

  const textDocument = {
    text: 'const value = 1',
    uri: 'file:///test.ts',
  }
  const offset = 7

  expect(await Implementation.getImplementations(textDocument, offset)).toEqual([
    {
      endColumnIndex: 11,
      endOffset: 11,
      endRowIndex: 0,
      lineText: 'const value = 1',
      startColumnIndex: 6,
      startOffset: 6,
      startRowIndex: 0,
      uri: 'file:///implementation.ts',
    },
  ])
  expect(writeFile).toHaveBeenCalledWith(textDocument.uri, textDocument.text)
  expect(getImplementationAtPosition).toHaveBeenCalledWith(textDocument.uri, offset)
})

test('getImplementations - empty', async () => {
  const getImplementationAtPosition = jest.fn((_fileName: string, _offset: number) => undefined)
  jest.spyOn(GetOrCreateLanguageService, 'getOrCreateLanguageService').mockReturnValue({
    fs: {
      readFile: jest.fn(),
      writeFile: jest.fn(),
    },
    languageService: {
      getImplementationAtPosition,
    },
  } as any)

  expect(await Implementation.getImplementations({ text: '', uri: 'file:///test.ts' }, 0)).toEqual([])
})
