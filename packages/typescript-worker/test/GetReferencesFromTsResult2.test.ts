import { expect, jest, test } from '@jest/globals'
import { createFileSystem } from '../src/parts/CreateFileSystem/CreateFileSystem.ts'
import { getLibFileUrl } from '../src/parts/GetLibFileUrl/GetLibFileUrl.ts'
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

test('returns an empty list when TypeScript has no reference result', async () => {
  const fs = createFileSystem()
  const readFile = jest.fn<(uri: string) => Promise<string>>()

  await expect(getReferencesFromTsResult2(undefined, fs, readFile)).resolves.toEqual([])
  expect(readFile).not.toHaveBeenCalled()
})

test('formats TypeScript library references as openable library URLs', async () => {
  const fs = createFileSystem()
  fs.writeFile('lib.es5.d.ts', 'declare const value: string')
  const readFile = jest.fn<(uri: string) => Promise<string>>()

  await expect(
    getReferencesFromTsResult2(
      [{ fileName: 'lib.es5.d.ts', isWriteAccess: false, textSpan: { length: 5, start: 15 } }],
      fs,
      readFile,
    ),
  ).resolves.toEqual([
    {
      endColumnIndex: 20,
      endRowIndex: 0,
      startColumnIndex: 15,
      startRowIndex: 0,
      uri: getLibFileUrl('lib.es5.d.ts'),
    },
  ])
  expect(readFile).not.toHaveBeenCalled()
})
