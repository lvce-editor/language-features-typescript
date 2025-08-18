import type ts from 'typescript'
import type { IFileSystem } from '../CreateFileSystem/CreateFileSystem.ts'
import { getPositionAt } from '../GetPositionAt/GetPositionAt.ts'

const getReferenceFromTsResult = async (reference: ts.ReferenceEntry, fs: IFileSystem) => {
  const { fileName, textSpan } = reference
  const text = await fs.readFile(fileName)
  const startPosition = getPositionAt(text, textSpan.start)
  const endPosition = getPositionAt(text, textSpan.start + textSpan.length)
  return {
    uri: fileName,
    startRowIndex: startPosition.rowIndex,
    startColumnIndex: startPosition.columnIndex,
    endRowIndex: endPosition.rowIndex,
    endColumnIndex: endPosition.columnIndex,
  }
}

export const getReferencesFromTsResult2 = async (
  tsResult: readonly ts.ReferenceEntry[] | undefined,
  fs: IFileSystem,
) => {
  if (!tsResult) {
    return []
  }
  const references = await Promise.all(tsResult.map((item) => getReferenceFromTsResult(item, fs)))
  return references
}
