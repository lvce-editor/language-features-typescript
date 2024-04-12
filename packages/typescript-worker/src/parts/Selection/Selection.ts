import type { CommonRpc } from '../CommonRpc/CommonRpc.ts'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.js'

const getPositionsFromTsResult = (positions: any[], tsResult: any) => {
  if (!tsResult || tsResult.length === 0) {
    return []
  }

  const [startRowIndex, startColumnIndex, endRowIndex, endColumnIndex] = positions

  const [first] = tsResult
  let current = first
  while (true) {
    const { textSpan } = current
    const { start, end } = textSpan
    const rangeStartRowIndex = start.line - 1
    const rangeStartColumnIndex = start.offset - 1
    const rangeEndRowIndex = end.line - 1
    const rangeEndColumnIndex = end.offset - 1
    if (
      !(
        rangeStartRowIndex >= startRowIndex &&
        rangeStartColumnIndex >= startColumnIndex &&
        rangeEndRowIndex <= endRowIndex &&
        rangeEndColumnIndex <= endColumnIndex
      )
    ) {
      break
    }
    if (!current.parent) {
      return
    }
    current = current.parent
  }

  const { textSpan } = current
  const { start, end } = textSpan
  return [start.line - 1, start.offset - 1, end.line - 1, end.offset - 1]
}

const getLocations = (positions: any) => {
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

export const expandSelection = async (typeScriptRpc: CommonRpc, Position: any, textDocument: any, positions: any[]) => {
  await TextDocumentSync.openTextDocuments2(typeScriptRpc, [textDocument])
  const locations = getLocations(positions)
  const tsResult = await typeScriptRpc.invoke('Selection.expandSelection', {
    file: textDocument.uri,
    locations,
  })
  const newPositions = getPositionsFromTsResult(positions, tsResult)
  return newPositions
}
