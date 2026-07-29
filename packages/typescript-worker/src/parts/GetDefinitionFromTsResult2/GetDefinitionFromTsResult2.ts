import type ts from 'typescript'
import type { IFileSystem } from '../IFileSystem/IFileSystem.ts'
import { getPositionAt } from '../GetPositionAt/GetPositionAt.ts'

const getUri = (fileName: string) => {
  if (fileName.includes('/node_modules/@typescript/lib') || fileName.includes('node_modules/@typescript/lib')) {
    const base = fileName
      .slice(fileName.lastIndexOf('/') + 1)
      .replaceAll('-', '.')
      .replace('.ts', '.d.ts')
    const almost = new URL(`../../../node_modules/typescript/lib/${base}`, import.meta.url).href
    const uri = almost.slice(almost.indexOf('/remote') + '/remote'.length)
    return uri
  }
  return fileName
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
  const text = fs.readFile(fileName) || (await readFile(fileName))
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
