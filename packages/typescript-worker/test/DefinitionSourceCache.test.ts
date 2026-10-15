import { expect, jest, test } from '@jest/globals'

const source = { text: 'export const target = 1;' }
const readFile = jest.fn(async () => source.text)
const fs = { readFile: () => undefined, writeFile: jest.fn() }
jest.unstable_mockModule('../src/parts/GetOrCreateLanguageService/GetOrCreateLanguageService.ts', () => ({
  getOrCreateLanguageService: () => ({
    fs,
    languageService: {
      getDefinitionAtPosition: () => [{ fileName: '/workspace/target.ts', textSpan: { length: 6, start: 13 } }],
      getProgram: () => ({ getSourceFile: () => source }),
    },
  }),
}))
jest.unstable_mockModule('../src/parts/Rpc/Rpc.ts', () => ({ invoke: readFile }))
const { getDefinition2 } = await import('../src/parts/Definition2/Definition2.ts')

test('repeated definitions use the analyzed source snapshot without additional filesystem RPCs', async () => {
  const document = { text: 'target', uri: '/workspace/main.ts' }
  for (let index = 0; index < 10; index++) {
    expect(await getDefinition2(document, 0)).toEqual({
      endColumnIndex: 19,
      endOffset: 19,
      endRowIndex: 0,
      startColumnIndex: 13,
      startOffset: 13,
      startRowIndex: 0,
      uri: '/workspace/target.ts',
    })
  }
  expect(readFile).not.toHaveBeenCalled()
})
