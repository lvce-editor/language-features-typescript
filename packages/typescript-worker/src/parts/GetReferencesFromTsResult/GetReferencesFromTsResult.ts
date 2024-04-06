const getReferenceFromTsResult = (reference) => {
  const { start, end, file } = reference
  return {
    uri: file,
    startRowIndex: start.line - 1,
    startColumnIndex: start.offset - 1,
    endRowIndex: end.line - 1,
    endColumnIndex: end.offset - 1,
  }
}

export const getReferencesFromTsResult = (textDocument, tsResult) => {
  const references = tsResult.refs.map(getReferenceFromTsResult)
  return references
}
