import * as GetReferencesFromTsResult from '../GetReferencesFromTsResult/GetReferencesFromTsResult.js'
import * as Position from '../Position/Position.js'
import * as Rpc from '../Rpc/Rpc.js'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.js'

export const languageId = 'typescript'

// TODO should this function return positions or offsets?
// when it returns offset, need to convert it to position anyway for references view
// which might be very inefficient

/**
 * @type{vscode.ReferenceProvider['provideReferences']}
 */
export const provideReferences = async (textDocument, offset) => {
  await TextDocumentSync.openTextDocuments([textDocument])
  const tsPosition = Position.getTsPosition(textDocument, offset)
  const tsResult = await Rpc.invoke('References.getReferences', {
    file: textDocument.uri,
    line: tsPosition.line,
    offset: tsPosition.offset,
  })
  const references = GetReferencesFromTsResult.getReferencesFromTsResult(
    textDocument,
    tsResult
  )
  return references
}
