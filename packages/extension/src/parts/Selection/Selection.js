import * as Rpc from '../Rpc/Rpc.js'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.js'

const getPositionsFromTsResult = (tsResult) => {
  if (!tsResult || tsResult.length === 0) {
    return []
  }
  let minLine = Infinity
  let minLineColumn = Infinity
  let maxLine = 0
  let maxLineColumn = 0
  for (const element of tsResult) {
    const { textSpan } = element
    const { start, end } = textSpan
    if (start.line < minLine) {
      minLine = start.line
      minLineColumn = start.offset
    }
    if (end.line > maxLine) {
      maxLine = end.line
      maxLineColumn = end.offset
    }
  }
  return [minLine - 1, minLineColumn - 1, maxLine - 1, maxLineColumn - 1]
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
    if (next.line === last.line && next.offset === last.offset) {
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
  console.log({ positions, locations, tsResult })
  return newPositions
}
