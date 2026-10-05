import { beforeEach, expect, jest, test } from '@jest/globals'

const writeFile = jest.fn()
const getRenameInfo = jest.fn((_uri: string, _offset: number, _options: any): any => ({
  canRename: true,
  displayName: 'alpha',
  triggerSpan: { start: 6, length: 5 },
}))

jest.unstable_mockModule('../src/parts/GetOrCreateLanguageService/GetOrCreateLanguageService.ts', () => ({
  resetLanguageServices: jest.fn(),
  getOrCreateLanguageService() {
    return { fs: { writeFile }, languageService: { getRenameInfo } }
  },
}))

const { commandMap } = await import('../src/parts/CommandMap/CommandMap.ts')
const prepareRename = commandMap['Rename.prepareRename']
const textDocument = { uri: 'memfs:///workspace/main.ts', text: 'const alpha = 1\n' }

beforeEach(() => {
  writeFile.mockClear()
  getRenameInfo.mockClear()
})

test('preparation command passes the document and offset through the worker wrapper', async () => {
  await expect(prepareRename(textDocument, 8)).resolves.toEqual({
    placeholder: 'alpha',
    range: { start: 6, length: 5 },
  })
  expect(writeFile).toHaveBeenCalledWith(textDocument.uri, textDocument.text)
  expect(getRenameInfo).toHaveBeenCalledWith(textDocument.uri, 8, {})
})

test('preparation command suppresses symbols that TypeScript cannot rename', async () => {
  getRenameInfo.mockReturnValueOnce({ canRename: false })
  await expect(prepareRename(textDocument, 8)).resolves.toBeUndefined()
})

test('preparation command preserves provider failures', async () => {
  getRenameInfo.mockImplementationOnce(() => {
    throw new Error('preparation failed')
  })
  await expect(prepareRename(textDocument, 8)).rejects.toThrow('preparation failed')
})
