import type ts from 'typescript'
import { getLibFileUrl } from '../GetLibFileUrl/GetLibFileUrl.ts'
import { getPositionAt } from '../GetPositionAt/GetPositionAt.ts'
import type { IFileSystem } from '../IFileSystem/IFileSystem.ts'
import { isLibFile } from '../IsLibFile/IsLibFile.ts'

const formatLibFileMaybe = (uri: string): string => {
  if (!isLibFile(uri)) {
    return uri
  }
  const formattedUrl = getLibFileUrl(uri)
  return formattedUrl
}

const getReferenceFromTsResult = async (reference: ts.ReferenceEntry, fs: IFileSystem) => {
  const { fileName, textSpan } = reference
  const text = await fs.readFile(fileName)
  const startPosition = getPositionAt(text, textSpan.start)
  const endPosition = getPositionAt(text, textSpan.start + textSpan.length)
  const formattedUri = formatLibFileMaybe(fileName)
  return {
    uri: formattedUri,
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
