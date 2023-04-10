import * as Position from '../Position/Position.js'

/**
 *
 * @param {vscode.TextDocument} textDocument
 * @param {import('typescript/lib/protocol').ReferencesResponseBody} tsResult
 * @returns {readonly vscode.Reference[]}
 */
export const getReferencesFromTsResult = (textDocument, tsResult) => {
  const references = []
  for (const ref of tsResult.refs) {
    const startOffset = Position.getOffset(textDocument, ref.start)
    const endOffset = Position.getOffset(textDocument, ref.end)
    references.push({
      uri: ref.file,
      startOffset,
      endOffset,
      lineText: ref.lineText,
    })
  }
  console.log(tsResult.refs)
  return references
}
