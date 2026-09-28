import { expect, jest, test } from '@jest/globals'

const getOrCreateLanguageService = jest.fn((_uri: string) => ({
  fs: { writeFile: jest.fn() },
  languageService: { getDefinitionAtPosition: jest.fn(() => undefined) },
}))
jest.unstable_mockModule('../src/parts/GetOrCreateLanguageService/GetOrCreateLanguageService.ts', () => ({
  getOrCreateLanguageService,
}))

const { getDefinition2 } = await import('../src/parts/Definition2/Definition2.ts')

test('returns undefined when the language service finds no definition', async () => {
  const textDocument = { text: 'const value = 1', uri: '/workspace/main.ts' }

  await expect(getDefinition2(textDocument, 6)).resolves.toBeUndefined()
  expect(getOrCreateLanguageService).toHaveBeenCalledWith(textDocument.uri)
})
