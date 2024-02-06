import * as Rpc from '../Rpc/Rpc.js'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.js'

const getPositionsFromTsResult = (tsResult) => {
  if (!tsResult || tsResult.length === 0) {
    return []
  }
  const [first] = tsResult
  const { textSpan } = first
  const { start, end } = textSpan
  return [start.line - 1, start.offset - 1, end.line - 1, end.offset - 1]
}

export const expandSelection = async (textDocument, positions) => {
  await TextDocumentSync.openTextDocuments([textDocument])
  const rowIndex = positions[0]
  const columnIndex = positions[1]
  const tsResult = await Rpc.invoke('Selection.expandSelection', {
    file: textDocument.uri,
    locations: [
      {
        line: rowIndex + 1,
        offset: columnIndex + 1,
      },
    ],
  })
  const newPositions = getPositionsFromTsResult(tsResult)
  return newPositions
}
