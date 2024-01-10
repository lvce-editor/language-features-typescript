const getReferenceFromTsResult = (reference) => {
  const { start, end, file, lineText } = reference
  return {
    uri: file,
    startRowIndex: start.line,
    startColumnIndex: start.offset - 1,
    endRowIndex: end.line,
    endColumnIndex: end.offset - 1,
    lineText: lineText,

    // deprecated
    endOffset: end.offset - 1,
    startOffset: start.offset - 1,
  }
}

/**
 *
 * @param {vscode.TextDocument} textDocument
 * @param {import('typescript/lib/protocol').ReferencesResponseBody} tsResult
 * @returns {readonly vscode.Reference[]}
 */
export const getReferencesFromTsResult = (textDocument, tsResult) => {
  const references = tsResult.refs.map(getReferenceFromTsResult)
  return references
}
