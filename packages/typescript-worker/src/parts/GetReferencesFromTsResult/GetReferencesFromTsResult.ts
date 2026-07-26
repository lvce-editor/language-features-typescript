import type * as TypeScriptProtocol from '../TypeScriptProtocol/TypeScriptProtocol.ts'

const getReferenceFromTsResult = (reference: TypeScriptProtocol.ReferencesResponseItem) => {
  const { end, file, start } = reference
  return {
    endColumnIndex: end.offset - 1,
    endRowIndex: end.line - 1,
    startColumnIndex: start.offset - 1,
    startRowIndex: start.line - 1,
    uri: file,
  }
}

export const getReferencesFromTsResult = (textDocument: any, tsResult: TypeScriptProtocol.ReferencesResponseBody) => {
  const references = tsResult.refs.map(getReferenceFromTsResult)
  return references
}
