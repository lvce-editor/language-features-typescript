import type { CommonRpc } from '../CommonRpc/CommonRpc.ts'
import * as GetPositionsFromTsResult from '../GetPositionsFromTsResult/GetPositionsFromTsResult.ts'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.ts'
import type * as TypeScriptProtocol from '../TypeScriptProtocol/TypeScriptProtocol.ts'

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

export const expandSelection = async (
  typeScriptRpc: CommonRpc,
  Position: any,
  textDocument: any,
  positions: Uint32Array,
) => {
  await TextDocumentSync.openTextDocuments2(typeScriptRpc, [textDocument])
  const locations = getLocations(positions)
  const tsResult = await typeScriptRpc.invoke<readonly TypeScriptProtocol.SelectionRange[]>(
    'Selection.expandSelection',
    {
      file: textDocument.uri,
      locations,
    },
  )
  const newPositions = GetPositionsFromTsResult.getPositionsFromTsResult(positions, tsResult)
  return newPositions
}
