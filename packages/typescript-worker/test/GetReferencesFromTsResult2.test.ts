import { expect, jest, test } from '@jest/globals'
import { createFileSystem } from '../src/parts/CreateFileSystem/CreateFileSystem.ts'
import { getReferencesFromTsResult2 } from '../src/parts/GetReferencesFromTsResult2/GetReferencesFromTsResult2.ts'

test('loads files that are not present in the in-memory file system', async () => {
  const fs = createFileSystem()
  const readFile = jest.fn<(uri: string) => Promise<string>>(async () => 'export default function App() {}')

  const references = await getReferencesFromTsResult2(
    [
      {
        fileName: 'file:///workspace/src/App.tsx',
        isWriteAccess: false,
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
  expect(references).toEqual([
    {
      endColumnIndex: 27,
      endRowIndex: 0,
      startColumnIndex: 24,
      startRowIndex: 0,
      uri: 'file:///workspace/src/App.tsx',
    },
  ])
})
