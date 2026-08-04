import type ts from 'typescript'
import type { IFileSystem } from '../IFileSystem/IFileSystem.ts'
import { getLibFileUrl } from '../GetLibFileUrl/GetLibFileUrl.ts'
import { getPositionAt } from '../GetPositionAt/GetPositionAt.ts'
import { isLibFile } from '../IsLibFile/IsLibFile.ts'
import { readLibFile } from '../ReadLibFile/ReadLibFile.ts'

export const toOpenableUri = (libFileUrl: string): string => {
  const url = new URL(libFileUrl)
  if (url.protocol === 'http:' || url.protocol === 'https:') {
    return `fetch://${url.host}${url.pathname}${url.search}${url.hash}`
  }
  return libFileUrl
}

const getUri = (fileName: string) => {
  if (isLibFile(fileName)) {
    return toOpenableUri(getLibFileUrl(fileName))
  }
  return fileName
}

const getText = async (
  fileName: string,
  fs: IFileSystem,
  readFile: (uri: string) => Promise<string>,
): Promise<string> => {
  const cachedText = fs.readFile(fileName)
  if (cachedText) {
    return cachedText
  }
  if (isLibFile(fileName)) {
    const libText = readLibFile(fileName)
    if (libText) {
      return libText
    }
  }
  return readFile(fileName)
}

export const getDefinitionFromTsResult2 = async (
  tsResult: readonly ts.DefinitionInfo[],
  fs: IFileSystem,
  readFile: (uri: string) => Promise<string>,
) => {
  if (tsResult.length === 0) {
    return undefined
  }
  const firstDefinition = tsResult[0]
  const { fileName, textSpan } = firstDefinition
  const uri = getUri(fileName)
  const text = await getText(fileName, fs, readFile)
  const startOffset = textSpan.start
  const endOffset = textSpan.start + textSpan.length
  const startPosition = getPositionAt(text, startOffset)
  const endPosition = getPositionAt(text, endOffset)
  return {
    endColumnIndex: endPosition.columnIndex,
    endOffset,
    endRowIndex: endPosition.rowIndex,
    startColumnIndex: startPosition.columnIndex,
    startOffset,
    startRowIndex: startPosition.rowIndex,
    uri,
  }
}
