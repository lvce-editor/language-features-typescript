import { expect, jest, test } from '@jest/globals'
import ts from 'typescript'
import { createFileSystem } from '../src/parts/CreateFileSystem/CreateFileSystem.ts'
import { getDefinitionFromTsResult2 } from '../src/parts/GetDefinitionFromTsResult2/GetDefinitionFromTsResult2.ts'

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
