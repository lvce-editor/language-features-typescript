import type ts from 'typescript'

const getUri = (fileName: string) => {
  if (fileName.includes('/node_modules/@typescript/lib') || fileName.includes('node_modules/@typescript/lib')) {
    const base = fileName
      .slice(fileName.lastIndexOf('/') + 1)
      .replaceAll('-', '.')
      .replace('.ts', '.d.ts')
    const almost = new URL(`../../../node_modules/typescript/lib/${base}`, import.meta.url).toString()
    const uri = almost.slice(almost.indexOf('/remote') + '/remote'.length)
    return uri
  }
  return fileName
}

export const getDefinitionFromTsResult2 = async (textDocument: any, tsResult: readonly ts.DefinitionInfo[]) => {
  if (tsResult.length === 0) {
    return undefined
  }
  const firstDefinition = tsResult[0]
  const uri = getUri(firstDefinition.fileName)
  let startOffset = 0
  let endOffset = 0
  if (firstDefinition.contextSpan) {
    startOffset = firstDefinition.contextSpan.start
    endOffset = firstDefinition.contextSpan.start + firstDefinition.contextSpan.length
  }
  return {
    uri,
    startOffset,
    endOffset,
  }
  // const { textSpan } = firstDefinition
  // if (file === textDocument.uri) {
  //   // TODO
  //   const startOffset = 0
  //   //  await Position.getOffset(textDocument, {
  //   //   rowIndex: start.line - 1,
  //   //   columnIndex: start.offset - 1,
  //   // })

  //   const endOffset = await 0
  //   //  Position.getOffset(textDocument, {
  //   //   rowIndex: end.line - 1,
  //   //   columnIndex: end.offset - 1,
  //   // })
  //   return {
  //     uri: file,
  //     startOffset,
  //     endOffset,
  //   }
  // }
  // TODO want offset based result
  // probably would require to read file and map position to offset (very slow)
  // const startOffset = 0
  // const endOffset = 0
  // return {
  //   uri: file,
  //   startRowIndex: start.line - 1,
  //   startColumnIndex: start.offset - 1,
  //   endRowIndex: end.line - 1,
  //   endColumnIndex: end.offset - 1,
  //   startOffset,
  //   endOffset,
  // }
}
