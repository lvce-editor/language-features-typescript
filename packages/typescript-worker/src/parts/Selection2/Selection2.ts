import type { SelectionRange } from 'typescript'
import { getOffset } from '../GetOffset/GetOffset.ts'
import * as GetOrCreateLanguageService from '../GetOrCreateLanguageService/GetOrCreateLanguageService.ts'
import { getPositionAt } from '../GetPositionAt/GetPositionAt.ts'

const getNextRange = (
  range: SelectionRange,
  selectionStart: number,
  selectionEnd: number,
): SelectionRange | undefined => {
  let current: SelectionRange | undefined = range
  while (current) {
    const rangeStart = current.textSpan.start
    const rangeEnd = rangeStart + current.textSpan.length
    const containsSelection = rangeStart <= selectionStart && rangeEnd >= selectionEnd
    const growsSelection = rangeStart < selectionStart || rangeEnd > selectionEnd
    if (containsSelection && growsSelection) {
      return current
    }
    current = current.parent
  }
  return undefined
}

const expandSelection = (
  text: string,
  languageService: any,
  uri: string,
  positions: readonly number[] | Uint32Array,
  index: number,
): number[] => {
  const anchorOffset = getOffset(text, positions[index], positions[index + 1])
  const activeOffset = getOffset(text, positions[index + 2], positions[index + 3])
  const selectionStart = Math.min(anchorOffset, activeOffset)
  const selectionEnd = Math.max(anchorOffset, activeOffset)
  const range = languageService.getSmartSelectionRange(uri, selectionStart)
  const nextRange = getNextRange(range, selectionStart, selectionEnd)
  if (!nextRange) {
    return [...positions].slice(index, index + 4)
  }
  const rangeStart = nextRange.textSpan.start
  const rangeEnd = rangeStart + nextRange.textSpan.length
  const startPosition = getPositionAt(text, rangeStart)
  const endPosition = getPositionAt(text, rangeEnd)
  if (anchorOffset <= activeOffset) {
    return [startPosition.rowIndex, startPosition.columnIndex, endPosition.rowIndex, endPosition.columnIndex]
  }
  return [endPosition.rowIndex, endPosition.columnIndex, startPosition.rowIndex, startPosition.columnIndex]
}

export const expandSelection2 = async (
  textDocument: any,
  positions: readonly number[] | Uint32Array,
): Promise<number[]> => {
  const { fs, languageService } = GetOrCreateLanguageService.getOrCreateLanguageService(textDocument.uri)
  fs.writeFile(textDocument.uri, textDocument.text)
  const newPositions: number[] = []
  for (let index = 0; index + 3 < positions.length; index += 4) {
    newPositions.push(...expandSelection(textDocument.text, languageService, textDocument.uri, positions, index))
  }
  return newPositions
}
