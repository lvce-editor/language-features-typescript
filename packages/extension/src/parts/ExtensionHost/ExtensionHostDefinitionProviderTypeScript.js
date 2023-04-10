import * as GetDefinitionFromTsResult from '../GetDefinitionFromTsResult/GetDefinitionFromTsResult.js'
import * as Position from '../Position/Position.js'
import * as Rpc from '../Rpc/Rpc.js'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.js'

export const languageId = 'typescript'

/**
 * @type{vscode.DefinitionProvider['provideDefinition']}
 */
export const provideDefinition = async (textDocument, offset) => {
  await TextDocumentSync.openTextDocuments([textDocument])
  const tsPosition = Position.getTsPosition(textDocument, offset)
  const tsResult = await Rpc.invoke('Definition.getDefinition', {
    file: textDocument.uri,
    line: tsPosition.line,
    offset: tsPosition.offset,
  })
  const definition = GetDefinitionFromTsResult.getDefinitionFromTsResult(
    textDocument,
    tsResult
  )
  return definition
}
