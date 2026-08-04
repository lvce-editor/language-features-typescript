import { expect, jest, test } from '@jest/globals'
import ts from 'typescript'
import { createFileSystem } from '../src/parts/CreateFileSystem/CreateFileSystem.ts'
import {
  getDefinitionFromTsResult2,
  toOpenableUri,
} from '../src/parts/GetDefinitionFromTsResult2/GetDefinitionFromTsResult2.ts'
import { getLibFileUrl } from '../src/parts/GetLibFileUrl/GetLibFileUrl.ts'

test('loads the target file and converts its symbol span', async () => {
  const fs = createFileSystem()
  const readFile = jest.fn<(uri: string) => Promise<string>>(async () => {
    return 'export default function App() {}'
  })

  const definition = await getDefinitionFromTsResult2(
    [
      {
        containerKind: ts.ScriptElementKind.unknown,
        containerName: '"./App.tsx"',
        fileName: 'file:///workspace/src/App.tsx',
        kind: ts.ScriptElementKind.functionElement,
        name: 'App',
        textSpan: {
          length: 3,
          start: 24,
        },
      },
    ],
    fs,
    readFile,
  )

  expect(readFile).toHaveBeenCalledWith('file:///workspace/src/App.tsx')
  expect(definition).toEqual({
    endColumnIndex: 27,
    endOffset: 27,
    endRowIndex: 0,
    startColumnIndex: 24,
    startOffset: 24,
    startRowIndex: 0,
    uri: 'file:///workspace/src/App.tsx',
  })
})

test('returns undefined when TypeScript finds no definition', async () => {
  const fs = createFileSystem()
  const readFile = jest.fn<(uri: string) => Promise<string>>()

  expect(await getDefinitionFromTsResult2([], fs, readFile)).toBeUndefined()
  expect(readFile).not.toHaveBeenCalled()
})

test.each([
  [
    'http://localhost:3000/extensions/typescript/lib/lib.es5.d.ts',
    'fetch://localhost:3000/extensions/typescript/lib/lib.es5.d.ts',
  ],
  ['https://example.com/lib.es5.d.ts?version=1#round', 'fetch://example.com/lib.es5.d.ts?version=1#round'],
  ['lvce://-/abc/extensions/typescript/lib/lib.es5.d.ts', 'lvce://-/abc/extensions/typescript/lib/lib.es5.d.ts'],
  ['file:///extension/typescript/lib/lib.es5.d.ts', 'file:///extension/typescript/lib/lib.es5.d.ts'],
])('converts the library asset URL %s to %s', (libFileUrl, expected) => {
  expect(toOpenableUri(libFileUrl)).toBe(expected)
})

test.each(['lib.es5.d.ts', 'node_modules/@typescript/lib-es5.d.ts'])(
  'converts the TypeScript library target %s to its complete openable asset URL',
  async (fileName) => {
    const fs = createFileSystem()
    fs.writeFile(fileName, 'round')
    const readFile = jest.fn<(uri: string) => Promise<string>>(async () => 'round')

    const definition = await getDefinitionFromTsResult2(
      [
        {
          containerKind: ts.ScriptElementKind.unknown,
          containerName: 'Math',
          fileName,
          kind: ts.ScriptElementKind.memberFunctionElement,
          name: 'round',
          textSpan: {
            length: 5,
            start: 0,
          },
        },
      ],
      fs,
      readFile,
    )

    expect(readFile).not.toHaveBeenCalled()
    expect(definition?.uri).toBe(getLibFileUrl(fileName))
  },
)
