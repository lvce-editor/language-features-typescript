import type * as TypeScriptProtocol from '../TypeScriptProtocol/TypeScriptProtocol.ts'

export const getPositionsFromTsResult = (
  positions: Uint32Array,
  tsResult: readonly TypeScriptProtocol.SelectionRange[],
) => {
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
