import * as Position from '../Position/Position.js'
import * as Rpc from '../Rpc/Rpc.js'
import * as TextDocumentSync from '../TextDocumentSync/TextDocumentSync.js'

export const languageId = 'typescript'

/**
 * @type{vscode.DefinitionProvider['provideDefinition']}
 */
export const provideDefinition = async (textDocument, offset) => {
  const uri = textDocument.uri
  const tsPosition = Position.getTsPosition(textDocument, offset)
  console.log({ tsPosition })
  await TextDocumentSync.openTextDocuments([textDocument])
  const definition = await Rpc.invoke(
    'Definition.getDefinition',
    uri,
    tsPosition
  )
  console.log({ definition })
  // TODO
  // const tsResult = await TsServerRequests.definition({
  //   file: textDocument.uri,
  //   line: tsPosition.line,
  //   offset: tsPosition.offset,
  // })
  // const definition = getDefinitionFromTsResult(textDocument, tsResult)
  return undefined
}
