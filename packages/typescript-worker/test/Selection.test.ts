import { beforeEach, expect, jest, test } from '@jest/globals'

const writeFile = jest.fn()
const getSmartSelectionRange = jest.fn((_uri: string, _offset: number): any => ({
  parent: {
    parent: {
      textSpan: { length: 20, start: 0 },
    },
    textSpan: { length: 11, start: 8 },
  },
  textSpan: { length: 2, start: 16 },
}))

jest.unstable_mockModule('../src/parts/GetOrCreateLanguageService/GetOrCreateLanguageService.ts', () => ({
  getOrCreateLanguageService() {
    return {
      fs: { writeFile },
      languageService: { getSmartSelectionRange },
    }
  },
}))

const { expandSelection2 } = await import('../src/parts/Selection2/Selection2.ts')

const textDocument = {
  text: 'foo.bar(getUser(id))',
  uri: 'memfs:///workspace/test.ts',
}

beforeEach(() => {
  writeFile.mockClear()
  getSmartSelectionRange.mockClear()
})

test('expands a cursor to the innermost TypeScript selection range', async () => {
  await expect(expandSelection2(textDocument, new Uint32Array([0, 17, 0, 17]))).resolves.toEqual([0, 16, 0, 18])
  expect(getSmartSelectionRange).toHaveBeenCalledWith(textDocument.uri, 17)
  expect(writeFile).toHaveBeenCalledWith(textDocument.uri, textDocument.text)
})

test('walks to the next parent when the current range is already selected', async () => {
  await expect(expandSelection2(textDocument, new Uint32Array([0, 16, 0, 18]))).resolves.toEqual([0, 8, 0, 19])
  await expect(expandSelection2(textDocument, new Uint32Array([0, 8, 0, 19]))).resolves.toEqual([0, 0, 0, 20])
})

test('keeps the outermost selection unchanged', async () => {
  await expect(expandSelection2(textDocument, new Uint32Array([0, 0, 0, 20]))).resolves.toEqual([0, 0, 0, 20])
})

test('preserves reversed selection direction', async () => {
  await expect(expandSelection2(textDocument, new Uint32Array([0, 18, 0, 16]))).resolves.toEqual([0, 19, 0, 8])
})

test('expands every selection in a multi-cursor selection', async () => {
  const positions = new Uint32Array([0, 17, 0, 17, 0, 16, 0, 18])
  await expect(expandSelection2(textDocument, positions)).resolves.toEqual([0, 16, 0, 18, 0, 8, 0, 19])
  expect(getSmartSelectionRange).toHaveBeenCalledTimes(2)
})

test('uses zero-based rows and columns when requesting a multiline range', async () => {
  getSmartSelectionRange.mockReturnValueOnce({ textSpan: { length: 2, start: 8 } })
  const multilineDocument = {
    text: 'first\n  id',
    uri: 'memfs:///workspace/multiline.ts',
  }

  await expect(expandSelection2(multilineDocument, new Uint32Array([1, 3, 1, 3]))).resolves.toEqual([1, 2, 1, 4])
  expect(getSmartSelectionRange).toHaveBeenCalledWith(multilineDocument.uri, 9)
})

test('returns an empty result for an empty selection list', async () => {
  await expect(expandSelection2(textDocument, new Uint32Array())).resolves.toEqual([])
  expect(getSmartSelectionRange).not.toHaveBeenCalled()
})
