import { expect, jest, test } from '@jest/globals'

const writeFile = jest.fn()
const getCombinedCodeFix = jest.fn((_scope: unknown, _fixId: string, _format: unknown, _preferences: unknown) => ({
  changes: [
    { fileName: '/c.ts', textChanges: [{ newText: "import { a } from './a.ts'\n\n", span: { length: 0, start: 0 } }] },
  ],
}))
jest.unstable_mockModule('../src/parts/GetOrCreateLanguageService/GetOrCreateLanguageService.ts', () => ({
  getOrCreateLanguageService: () => ({ fs: { writeFile }, languageService: { getCombinedCodeFix } }),
}))
const { addMissingImports } = await import('../src/parts/AddMissingImports/AddMissingImports.ts')
const { wrapCommand } = await import('../src/parts/WrapCommand/WrapCommand.ts')

test('the worker command synchronizes the current document and converts the combined missing import fix', async () => {
  const textDocument = { text: 'export const c = a + 1', uri: '/c.ts' }
  await expect(wrapCommand(addMissingImports)(textDocument)).resolves.toEqual([
    { endOffset: 0, inserted: "import { a } from './a.ts'\n\n", startOffset: 0 },
  ])
  expect(writeFile).toHaveBeenCalledWith('/c.ts', textDocument.text)
  expect(getCombinedCodeFix).toHaveBeenCalledWith({ fileName: '/c.ts', type: 'file' }, 'fixMissingImport', {}, {})
})
