import { expect, jest, test } from '@jest/globals'

const getCodeActionsFromTsResult = jest.fn((_uri: string, fixes: readonly unknown[]) => fixes)
const mockLanguageService = {
  getCodeFixesAtPosition: jest.fn(
    (
      _uri: string,
      _start: number,
      _end: number,
      _codes: readonly number[],
      _format: unknown,
      _preferences: unknown,
    ) => [{ description: 'Add missing property' }],
  ),
  getSemanticDiagnostics: jest.fn(() => [
    { code: 2339, length: 3, start: 1 },
    { code: 2304, length: 2, start: 10 },
  ]),
}
const getOrCreateLanguageService = jest.fn((_uri: string) => ({
  fs: { writeFile: jest.fn() },
  languageService: mockLanguageService,
}))
jest.unstable_mockModule('../src/parts/GetCodeActionsFromTsResult/GetCodeActionsFromTsResult.ts', () => ({
  getCodeActionsFromTsResult,
}))
jest.unstable_mockModule('../src/parts/GetOrCreateLanguageService/GetOrCreateLanguageService.ts', () => ({
  getOrCreateLanguageService,
}))

const { getCodeActions2 } = await import('../src/parts/CodeActions2/CodeActions2.ts')

test('converts fixes for diagnostics at the cursor and skips diagnostics elsewhere', async () => {
  const textDocument = { text: 'abc', uri: '/workspace/main.ts' }

  await expect(getCodeActions2(textDocument, 2)).resolves.toEqual([{ description: 'Add missing property' }])
  expect(mockLanguageService.getCodeFixesAtPosition).toHaveBeenCalledWith(
    '/workspace/main.ts',
    1,
    4,
    [2339],
    {},
    {},
  )
  expect(getCodeActionsFromTsResult).toHaveBeenCalledWith('/workspace/main.ts', [{ description: 'Add missing property' }])
})
