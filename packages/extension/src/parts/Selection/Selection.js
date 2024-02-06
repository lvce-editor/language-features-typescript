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

const getLocations = (positions) => {
  const locations = []
  let last = {
    line: 0,
    offset: 0,
  }
  for (let i = 0; i < positions.length; i += 2) {
    const next = {
      line: positions[i] + 1,
      offset: positions[i + 1] + 1,
    }
    if (next.line === last.line && next.column === last.column) {
      continue
    }
    last = next
    locations.push(next)
  }
  return locations
}

export const expandSelection = async (textDocument, positions) => {
  await TextDocumentSync.openTextDocuments([textDocument])
  const locations = getLocations(positions)
  const tsResult = await Rpc.invoke('Selection.expandSelection', {
    file: textDocument.uri,
    locations,
  })
  const newPositions = getPositionsFromTsResult(tsResult)
  return newPositions
}
