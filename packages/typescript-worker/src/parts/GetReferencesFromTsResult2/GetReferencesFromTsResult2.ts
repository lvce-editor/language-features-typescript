import type ts from 'typescript'
import type { IFileSystem } from '../IFileSystem/IFileSystem.ts'
import { getLibFileUrl } from '../GetLibFileUrl/GetLibFileUrl.ts'
import { getPositionAt } from '../GetPositionAt/GetPositionAt.ts'
import { isLibFile } from '../IsLibFile/IsLibFile.ts'

const formatLibFileMaybe = (uri: string): string => {
  if (!isLibFile(uri)) {
    return uri
  }
  const formattedUrl = getLibFileUrl(uri)
  return formattedUrl
}

const getReferenceFromTsResult = (reference: ts.ReferenceEntry, fs: IFileSystem) => {
  const { fileName, textSpan } = reference
  const text = fs.readFile(fileName)
  const startPosition = getPositionAt(text, textSpan.start)
  const endPosition = getPositionAt(text, textSpan.start + textSpan.length)
  const formattedUri = formatLibFileMaybe(fileName)
  return {
    endColumnIndex: endPosition.columnIndex,
    endRowIndex: endPosition.rowIndex,
    startColumnIndex: startPosition.columnIndex,
    startRowIndex: startPosition.rowIndex,
    uri: formattedUri,
  }
}

export const getReferencesFromTsResult2 = async (
  tsResult: readonly ts.ReferenceEntry[] | undefined,
  fs: IFileSystem,
) => {
  if (!tsResult) {
    return []
  }
  const references = tsResult.map((item) => getReferenceFromTsResult(item, fs))
  return references
}
