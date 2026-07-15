import { expect, jest, test } from '@jest/globals'

const writeFile = jest.fn()
const isValidBraceCompletionAtPosition = jest.fn((_uri: string, _offset: number, _characterCode: number) => true)

jest.unstable_mockModule('../src/parts/GetOrCreateLanguageService/GetOrCreateLanguageService.ts', () => ({
  getOrCreateLanguageService() {
    return {
      fs: {
        writeFile,
      },
      languageService: {
        isValidBraceCompletionAtPosition,
      },
    }
  },
}))

const { provideBraceCompletion } = await import('../src/parts/BraceCompletion2/BraceCompletion2.ts')

test('provideBraceCompletion updates the document and checks the opening brace', () => {
  const textDocument = {
    text: 'win',
    uri: 'memfs:///workspace/test.ts',
  }

  expect(provideBraceCompletion(textDocument, 3, '{')).toBe(true)
  expect(writeFile).toHaveBeenCalledWith(textDocument.uri, textDocument.text)
  expect(isValidBraceCompletionAtPosition).toHaveBeenCalledWith(textDocument.uri, 3, '{'.charCodeAt(0))
})
