import * as TsServerRequests from 'ts-server-requests'
import * as Position from '../Position/Position.js'
import * as TsPrimaryServer from '../TsPrimaryServer/TsPrimaryServer.js'

export const languageId = 'typescript'

/**
 *
 * @param {vscode.TextDocument} textDocument
 * @param {import('typescript/lib/protocol').ReferencesResponseBody} tsResult
 * @returns {readonly vscode.Reference[]}
 */
const getReferencesFromTsResult = (textDocument, tsResult) => {
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

// TODO should this function return positions or offsets?
// when it returns offset, need to convert it to position anyway for references view
// which might be very inefficient

/**
 * @type{vscode.ReferenceProvider['provideReferences']}
 */
export const provideReferences = async (textDocument, offset) => {
  const tsPosition = Position.getTsPosition(textDocument, offset)
  const server = TsPrimaryServer.getInstance()
  const tsResult = await TsServerRequests.references(server, {
    file: textDocument.uri,
    line: tsPosition.line,
    offset: tsPosition.offset,
  })
  console.log({ tsResult })
  const references = getReferencesFromTsResult(textDocument, tsResult)
  return references
}
