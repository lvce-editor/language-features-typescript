import { getOffset } from '../GetOffset/GetOffset.ts'
import { getPositionAt } from '../GetPositionAt/GetPositionAt.ts'
import * as LanguageServices from '../LanguageServices/LanguageServices.ts'
import * as GetOrCreateLanguageService from '../GetOrCreateLanguageService/GetOrCreateLanguageService.ts'

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

export const expandSelection2 = async (textDocument: any, positions: Uint32Array) => {
  const { fs, languageService } = GetOrCreateLanguageService.getOrCreateLanguageService(textDocument.uri)
  fs.writeFile(textDocument.uri, textDocument.text)
  const locations = getLocations(positions)
  const offsets = locations.map((location) => getOffset(textDocument.text, location.line, location.offset))
  if (offsets.length === 0) {
    return []
  }
  console.log({ locations })
  const firstOffset = offsets[0]
  const tsResult = languageService.getSmartSelectionRange(textDocument.uri, firstOffset)
  console.log({ tsResult })
  const start = tsResult.textSpan.start
  const end = start + tsResult.textSpan.length
  const startPosition = getPositionAt(textDocument.text, start)
  const endPosition = getPositionAt(textDocument.text, end)
  const newPositions = [
    startPosition.rowIndex,
    startPosition.columnIndex,
    endPosition.rowIndex,
    endPosition.columnIndex,
  ]
  return newPositions
}
